import { NextRequest, NextResponse } from "next/server";
import { aggregateMonthly, summariseClimate } from "@/lib/data-sources/climate";
import { fetchArchiveDaily } from "@/lib/data-sources/connectors";
import { storeFetch, readCached, locKey, logConnector } from "@/lib/data-sources/cache";
import { PROVIDER_NAMES } from "@/lib/data-sources/types";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * GET /api/env/climate?lat=..&lng=..
 * Compares 1991-2000 ERA5 daily reanalysis with the latest ten complete years.
 * Annual precipitation is an average annual total; month-of-year rainfall is
 * averaged across years. Months below 90% daily coverage are excluded.
 */
export async function GET(req: NextRequest) {
  const limited = rateLimit(req, "env-climate", 20, 60_000);
  if (limited) return limited;

  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lng = Number(req.nextUrl.searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: "Valid lat/lng required" }, { status: 400 });
  }

  const now = new Date();
  const recentEndYear = now.getUTCFullYear() - 1;
  const recentStartYear = recentEndYear - 9;
  const periodA = { start: "1991-01-01", end: "2000-12-31" };
  const periodB = { start: `${recentStartYear}-01-01`, end: `${recentEndYear}-12-31` };
  const provider = "open-meteo";
  const datasetId = "era5_archive_daily";
  const locationKey = locKey(lat, lng);
  const ttlSeconds = 30 * 24 * 3600;

  async function loadPeriod(period: { start: string; end: string }) {
    const from = new Date(`${period.start}T00:00:00Z`);
    const to = new Date(`${period.end}T23:59:59.999Z`);
    const cached = await readCached({ provider, datasetId, locationKey, from, to }, ttlSeconds, 15000);
    if (cached?.fresh) {
      return { rows: cached.rows, cached: true, retrievedAt: cached.retrievedAt, error: null as string | null };
    }
    try {
      const startedAt = Date.now();
      const fetched = await fetchArchiveDaily(lat, lng, period.start, period.end);
      const stored = await storeFetch(fetched);
      await logConnector(provider, "archive-daily", "ok", `stored=${stored.stored};dropped=${stored.dropped}`, Date.now() - startedAt);
      const refreshed = await readCached({ provider, datasetId, locationKey, from, to }, ttlSeconds, 15000);
      return { rows: refreshed?.rows ?? [], cached: false, retrievedAt: refreshed?.retrievedAt ?? new Date(), error: null as string | null };
    } catch (error) {
      const message = error instanceof Error ? error.message : "fetch failed";
      await logConnector(provider, "archive-daily", "error", message);
      if (!cached || cached.rows.length === 0) return { rows: [], cached: false, retrievedAt: null, error: message };
      return { rows: cached.rows, cached: true, retrievedAt: cached.retrievedAt, error: message };
    }
  }

  const [periodAData, periodBData] = await Promise.all([loadPeriod(periodA), loadPeriod(periodB)]);
  const aStart = new Date(`${periodA.start}T00:00:00Z`);
  const aEndExclusive = new Date(`${periodA.end}T00:00:00Z`);
  aEndExclusive.setUTCDate(aEndExclusive.getUTCDate() + 1);
  const bStart = new Date(`${periodB.start}T00:00:00Z`);
  const bEndExclusive = new Date(`${periodB.end}T00:00:00Z`);
  bEndExclusive.setUTCDate(bEndExclusive.getUTCDate() + 1);

  const toDailyObservations = (rows: typeof periodAData.rows) => rows.map((row) => ({
    parameter: row.parameter,
    observedAt: new Date(row.observedAt),
    value: row.value,
  }));

  const monthlyA = aggregateMonthly(toDailyObservations(periodAData.rows), aStart, aEndExclusive);
  const monthlyB = aggregateMonthly(toDailyObservations(periodBData.rows), bStart, bEndExclusive);
  const summaryA = summariseClimate(monthlyA);
  const summaryB = summariseClimate(monthlyB);

  const completeTemperatureMonthsA = monthlyA.filter((m) => m.temperatureMean !== null).length;
  const completeTemperatureMonthsB = monthlyB.filter((m) => m.temperatureMean !== null).length;
  const completePrecipitationMonthsA = monthlyA.filter((m) => m.precipitationTotal !== null).length;
  const completePrecipitationMonthsB = monthlyB.filter((m) => m.precipitationTotal !== null).length;

  // A comparison is published only when at least 90% of months in each
  // decadal window pass daily coverage, and precipitation has >=8 complete
  // calendar years in each decade. Thin samples remain visible as summaries
  // with warnings, but are not promoted to a period-to-period delta.
  const temperatureReady = summaryA.meanTemperature !== null && summaryB.meanTemperature !== null &&
    completeTemperatureMonthsA >= 108 && completeTemperatureMonthsB >= 108;
  const precipitationReady = summaryA.annualPrecipitation !== null && summaryB.annualPrecipitation !== null &&
    summaryA.completeYears >= 8 && summaryB.completeYears >= 8;
  const delta = temperatureReady || precipitationReady ? {
    meanTemperatureShift: temperatureReady ? summaryB.meanTemperature! - summaryA.meanTemperature! : null,
    precipitationShiftPercent: precipitationReady && summaryA.annualPrecipitation! > 0
      ? ((summaryB.annualPrecipitation! - summaryA.annualPrecipitation!) / summaryA.annualPrecipitation!) * 100
      : null,
  } : null;

  const warnings: string[] = [];
  if (periodAData.error) warnings.push(`1991-2000 archive fetch problem: ${periodAData.error}`);
  if (periodBData.error) warnings.push(`Recent-decade archive fetch problem: ${periodBData.error}`);
  if (summaryA.completeYears < 8) warnings.push(`1991-2000 has only ${summaryA.completeYears} complete precipitation year(s); the annual rainfall comparison may be unavailable or weak.`);
  if (summaryB.completeYears < 8) warnings.push(`${periodB.start.slice(0, 4)}-${periodB.end.slice(0, 4)} has only ${summaryB.completeYears} complete precipitation year(s); the annual rainfall comparison may be unavailable or weak.`);
  if (completeTemperatureMonthsA < 108) warnings.push(`1991-2000 has ${completeTemperatureMonthsA}/120 months with at least 90% paired daily temperature coverage.`);
  if (completeTemperatureMonthsB < 108) warnings.push(`${periodB.start.slice(0, 4)}-${periodB.end.slice(0, 4)} has ${completeTemperatureMonthsB}/120 months with at least 90% paired daily temperature coverage.`);
  if (completePrecipitationMonthsA < 108) warnings.push(`1991-2000 has ${completePrecipitationMonthsA}/120 months with at least 90% daily precipitation coverage.`);
  if (completePrecipitationMonthsB < 108) warnings.push(`${periodB.start.slice(0, 4)}-${periodB.end.slice(0, 4)} has ${completePrecipitationMonthsB}/120 months with at least 90% daily precipitation coverage.`);

  const retrievedTimes = [periodAData.retrievedAt, periodBData.retrievedAt]
    .filter((value): value is Date => value instanceof Date && Number.isFinite(value.getTime()))
    .map((value) => value.getTime());

  return NextResponse.json({
    location: { lat, lng },
    periods: {
      a: { label: "1991-2000", start: periodA.start, end: periodA.end },
      b: { label: `${recentStartYear}-${recentEndYear}`, start: periodB.start, end: periodB.end },
    },
    monthly: { a: monthlyA, b: monthlyB },
    summary: {
      a: { ...summaryA, completeTemperatureMonths: completeTemperatureMonthsA, completePrecipitationMonths: completePrecipitationMonthsA },
      b: { ...summaryB, completeTemperatureMonths: completeTemperatureMonthsB, completePrecipitationMonths: completePrecipitationMonthsB },
    },
    delta,
    analytics: {
      methodology:
        "Daily ERA5 reanalysis values are grouped by UTC calendar day. Daily mean temperature is calculated only when both daily maximum and minimum are present; monthly mean temperature is accepted only with at least 90% paired-day coverage. Monthly precipitation is the sum of daily totals and is accepted only with at least 90% day coverage. Annual precipitation is the mean of complete calendar-year totals (all 12 valid months), while month-of-year precipitation is the mean monthly total across valid years. No missing days are imputed.",
      dataKind: "historical model reanalysis (ERA5) — NOT station observations, NOT live data",
      confidence: delta ? "moderate (reanalysis-based; single grid cell; coverage-qualified)" : "unavailable — insufficient complete data",
      limitations: [
        "ERA5 is a model reanalysis at approximately 25 km resolution; local microclimates are not captured.",
        "Monthly values with less than 90% daily coverage are excluded; annual precipitation requires all 12 valid months.",
        "A correlation between periods does not identify causes; single-grid-cell comparisons cannot attribute climate-change signals.",
        "Precipitation reanalysis is uncertain in complex terrain.",
      ],
    },
    provenance: {
      provider,
      providerName: PROVIDER_NAMES[provider],
      datasetId,
      sourceUrl: "https://archive-api.open-meteo.com/v1/archive",
      licence: "ERA5 via Open-Meteo — free API restricted to non-commercial use, CC BY 4.0 attribution required",
      retrievedAt: retrievedTimes.length ? new Date(Math.max(...retrievedTimes)).toISOString() : null,
      cached: periodAData.cached && periodBData.cached,
      ...(warnings.length ? { warning: warnings.join(" ") } : {}),
    },
  });
}
