import { NextRequest, NextResponse } from "next/server";
import { fetchNasaClimatology } from "@/lib/data-sources/connectors";
import { storeFetch, readCached, locKey, logConnector } from "@/lib/data-sources/cache";
import { PROVIDER_NAMES } from "@/lib/data-sources/types";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * GET /api/env/solar?lat=..&lng=..
 * NASA POWER 22-year monthly climatology of global horizontal irradiance
 * (kWh/m2/day) + 2m temperature. Drives the solar-resource indicator and the
 * Renewable Energy solar calculator.
 */
export async function GET(req: NextRequest) {
  const limited = rateLimit(req, "env-solar", 20, 60000);
  if (limited) return limited;
  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lng = Number(req.nextUrl.searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: "Valid lat/lng required" }, { status: 400 });
  }

  const provider = "nasa-power";
  const datasetId = "power_climatology_point";
  const key = locKey(lat, lng);
  const TTL = 30 * 24 * 3600;

  const cached = await readCached({ provider, datasetId, locationKey: key }, TTL, 40);
  let rows = cached?.rows ?? [];
  let retrievedAt = cached?.retrievedAt ?? null;
  let cachedFlag = true;
  let warning: string | null = null;

  if (!cached || !cached.fresh) {
    try {
      const t0 = Date.now();
      const f = await fetchNasaClimatology(lat, lng);
      await storeFetch(f);
      await logConnector(provider, "climatology-point", "ok", undefined, Date.now() - t0);
      const refreshed = await readCached({ provider, datasetId, locationKey: key }, TTL, 40);
      rows = refreshed?.rows ?? [];
      retrievedAt = refreshed?.retrievedAt ?? new Date();
      cachedFlag = false;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "fetch failed";
      await logConnector(provider, "climatology-point", "error", msg);
      if (rows.length === 0) {
        return NextResponse.json({ error: "NASA POWER unreachable and no cached data for this location.", detail: msg }, { status: 502 });
      }
      warning = `Provider unreachable — showing CACHED climatology. ${msg}`;
    }
  }

  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const ghi = MONTH_NAMES.map((_, i) => {
    const row = rows.find((r) => r.parameter === "solar_ghi" && new Date(r.observedAt).getUTCMonth() === i);
    return row ? { month: MONTH_NAMES[i], value: row.value } : null;
  });
  const t2m = MONTH_NAMES.map((_, i) => {
    const row = rows.find((r) => r.parameter === "temperature_monthly" && new Date(r.observedAt).getUTCMonth() === i);
    return row ? { month: MONTH_NAMES[i], value: row.value } : null;
  });

  const ghiValues = ghi.filter((g): g is { month: string; value: number } => g !== null);
  const daysInMonth = (monthIndex: number) => new Date(Date.UTC(2001, monthIndex + 1, 0)).getUTCDate();
  const totalDays = ghiValues.reduce((sum, point) => sum + daysInMonth(MONTH_NAMES.indexOf(point.month)), 0);
  const annualMean = ghiValues.length === 12 && totalDays > 0
    ? ghiValues.reduce((sum, point) => sum + point.value * daysInMonth(MONTH_NAMES.indexOf(point.month)), 0) / totalDays
    : null;

  return NextResponse.json({
    location: { lat, lng },
    monthlyGhi: ghi,
    monthlyTemperature: t2m,
    annualMeanGhi: annualMean,
    provenance: {
      provider,
      providerName: PROVIDER_NAMES[provider],
      datasetId,
      sourceUrl: "https://power.larc.nasa.gov/api/temporal/climatology/point",
      licence: "NASA POWER — free and open use; attribution: NASA Langley Research Center POWER Project",
      retrievedAt: retrievedAt?.toISOString() ?? null,
      cached: cachedFlag,
      notes:
        "Satellite-derived 22-year (2001-2023) monthly climatology at the nearest POWER grid cell. ALLSKY_SFC_SW_DWN in community=RE units (kWh/m2/day). Climatological means, not current-year measurements.",
      ...(warning ? { warning } : {}),
    },
  });
}
