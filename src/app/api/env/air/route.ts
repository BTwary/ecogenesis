import { NextRequest, NextResponse } from "next/server";
import { fetchAirQuality } from "@/lib/data-sources/connectors";
import { fetchDataGovAir, dataGovApiKey, fetchOpenAq, openAqApiKey } from "@/lib/data-sources/keyed";
import { storeFetch, readCached, locKey, logConnector } from "@/lib/data-sources/cache";
import { isStale } from "@/lib/data-sources/quality";
import { PROVIDER_NAMES } from "@/lib/data-sources/types";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * GET /api/env/air?lat=..&lng=..&city=Delhi
 * CAMS gridded model estimates are the coordinate-based base series.
 * When configured, OpenAQ ground-station measurements and data.gov.in/CPCB
 * city station records are returned separately; datasets are never merged.
 */
export async function GET(req: NextRequest) {
  const limited = rateLimit(req, "env-air", 30, 60_000);
  if (limited) return limited;

  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lng = Number(req.nextUrl.searchParams.get("lng"));
  const city = (req.nextUrl.searchParams.get("city") ?? "").trim().slice(0, 80);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: "Valid lat/lng required" }, { status: 400 });
  }

  const provider = "open-meteo";
  const datasetId = "cams_air_quality_hourly";
  const key = locKey(lat, lng);
  const params = ["pm2_5", "pm10", "nitrogen_dioxide", "sulphur_dioxide", "ozone", "carbon_monoxide", "us_aqi"];
  const ttlSeconds = 45 * 60;
  const from = new Date(Date.now() - 26 * 3600 * 1000);
  const cached = await readCached({ provider, datasetId, parameters: params, locationKey: key, from }, ttlSeconds, 600);

  let rows = cached?.rows ?? [];
  let cachedFlag = true;
  let note: string | null = null;
  if (!cached || !cached.fresh) {
    try {
      const startedAt = Date.now();
      const fetched = await fetchAirQuality(lat, lng);
      const { stored, dropped } = await storeFetch(fetched);
      await logConnector(provider, "air-quality", "ok", `stored=${stored};dropped=${dropped}`, Date.now() - startedAt);
      const refreshed = await readCached({ provider, datasetId, parameters: params, locationKey: key, from }, ttlSeconds, 600);
      rows = refreshed?.rows ?? [];
      cachedFlag = false;
      if (dropped > 0) note = `${dropped} observation(s) dropped by data-quality checks.`;
      if (stored === 0 && rows.length === 0) note = "Provider returned no valid observations for this location.";
    } catch (error) {
      const message = error instanceof Error ? error.message : "fetch failed";
      await logConnector(provider, "air-quality", "error", message);
      if (rows.length === 0) {
        return NextResponse.json({
          error: "Air-quality provider unreachable and no cached observations exist for this location.",
          detail: message,
          groundStations: { openAqStatus: openAqApiKey() ? "not-queried" : "requires-key", cpcbStatus: dataGovApiKey() ? "city-required" : "requires-key" },
        }, { status: 502 });
      }
      note = `Provider unreachable — showing cached CAMS model estimates. ${message}`;
    }
  }

  const byParam = new Map<string, { observedAt: Date; value: number }[]>();
  for (const row of rows) {
    const series = byParam.get(row.parameter) ?? [];
    series.push({ observedAt: new Date(row.observedAt), value: row.value });
    byParam.set(row.parameter, series);
  }
  for (const series of byParam.values()) series.sort((a, b) => a.observedAt.getTime() - b.observedAt.getTime());

  const latest: Record<string, { value: number; observedAt: string; stale: boolean } | null> = {};
  for (const parameter of params) {
    const series = byParam.get(parameter) ?? [];
    const last = series[series.length - 1];
    latest[parameter] = last ? { value: last.value, observedAt: last.observedAt.toISOString(), stale: isStale(parameter, last.observedAt) } : null;
  }

  const newestRetrieved = rows.reduce((max, row) => Math.max(max, row.retrievedAt.getTime()), 0);
  const newestObserved = rows.reduce((max, row) => Math.max(max, row.observedAt.getTime()), 0);

  // Optional OpenAQ ground-station observations. Keep station values and units
  // separate from CAMS model estimates; store each at its station coordinates.
  let openAq: { status: string; readings: Awaited<ReturnType<typeof fetchOpenAq>>; error?: string } = {
    status: openAqApiKey() ? "unavailable" : "requires-key",
    readings: [],
  };
  if (openAqApiKey()) {
    try {
      const startedAt = Date.now();
      const readings = await fetchOpenAq(lat, lng, 25000);
      const grouped = new Map<number, typeof readings>();
      for (const reading of readings) grouped.set(reading.locationId, [...(grouped.get(reading.locationId) ?? []), reading]);
      for (const stationReadings of grouped.values()) {
        const station = stationReadings[0];
        await storeFetch({
          provider: "openaq",
          datasetId: "openaq_location_latest",
          lat: station.latitude,
          lng: station.longitude,
          sourceUrl: `https://api.openaq.org/v3/locations/${station.locationId}/latest`,
          licence: "OpenAQ API; underlying provider licences vary. Follow the source dataset licence and attribution requirements.",
          notes: `Ground-station readings from ${station.stationName}; values are not merged with CAMS model output.`,
          observations: stationReadings.map((reading) => ({
            parameter: reading.parameter,
            observedAt: new Date(reading.observedAtUtc),
            value: reading.value,
            unit: reading.unit,
            originalUnit: reading.unit,
            meta: { stationName: reading.stationName, locality: reading.locality, locationId: reading.locationId },
          })),
        });
      }
      await logConnector("openaq", "nearby-stations-latest", "ok", `readings=${readings.length}`, Date.now() - startedAt);
      openAq = { status: readings.length ? "available" : "no-nearby-readings", readings };
    } catch (error) {
      const message = error instanceof Error ? error.message : "OpenAQ request failed";
      await logConnector("openaq", "nearby-stations-latest", "error", message);
      openAq = { status: "unavailable", readings: [], error: message };
    }
  }

  // Optional India CPCB station records. The public dataset is city-filtered,
  // not a coordinate-radius feed; the city is therefore explicit in the query.
  let cpcb: { status: string; city: string | null; readings: Awaited<ReturnType<typeof fetchDataGovAir>>; error?: string } = {
    status: dataGovApiKey() ? (city ? "unavailable" : "city-required") : "requires-key",
    city: city || null,
    readings: [],
  };
  if (dataGovApiKey() && city) {
    try {
      const startedAt = Date.now();
      const readings = await fetchDataGovAir(city, 100);
      const valid = readings.filter((reading) => reading.station && reading.pollutant && reading.avg !== null && Number.isFinite(reading.avg) && reading.avg >= 0);
      await logConnector("datagovin", "cpcb-city-air-quality", "ok", `city=${city};records=${valid.length}`, Date.now() - startedAt);
      cpcb = { status: valid.length ? "available" : "no-city-records", city, readings: valid };
    } catch (error) {
      const message = error instanceof Error ? error.message : "data.gov.in request failed";
      await logConnector("datagovin", "cpcb-city-air-quality", "error", message);
      cpcb = { status: "unavailable", city, readings: [], error: message };
    }
  }

  return NextResponse.json({
    location: { lat, lng },
    latest,
    series: Object.fromEntries([...byParam.entries()].map(([parameter, series]) => [parameter, series.map((point) => ({ t: point.observedAt.toISOString(), v: point.value }))])),
    groundStations: {
      openAqStatus: openAq.status,
      openAqReadings: openAq.readings,
      ...(openAq.error ? { openAqError: openAq.error } : {}),
      cpcbStatus: cpcb.status,
      cpcbCity: cpcb.city,
      cpcbReadings: cpcb.readings,
      ...(cpcb.error ? { cpcbError: cpcb.error } : {}),
    },
    provenance: {
      provider,
      providerName: PROVIDER_NAMES[provider],
      datasetId,
      sourceUrl: "https://air-quality-api.open-meteo.com/v1/air-quality",
      licence: "CAMS data redistributed by Open-Meteo — CC BY 4.0 attribution; free API restricted to non-commercial use",
      retrievedAt: newestRetrieved ? new Date(newestRetrieved).toISOString() : null,
      cached: cachedFlag,
      stale: note?.includes("cached") || undefined,
      notes: "CAMS model-based estimates from the Copernicus Atmosphere Monitoring Service interpolated to the requested coordinates — NOT in-situ station measurements. Optional OpenAQ and CPCB station readings are returned separately when their credentials and coverage are available.",
      ...(note ? { warning: note } : {}),
    },
    quality: { newestObservation: newestObserved ? new Date(newestObserved).toISOString() : null },
  });
}
