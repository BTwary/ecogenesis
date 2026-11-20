import { NextRequest, NextResponse } from "next/server";
import { fetchArchiveDaily } from "@/lib/data-sources/connectors";
import { storeFetch, readCached, locKey, logConnector } from "@/lib/data-sources/cache";
import { PROVIDER_NAMES } from "@/lib/data-sources/types";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Last 12 complete calendar months of ERA5 daily precipitation; partial months are not reported as totals. */
export async function GET(req: NextRequest) {
  const limited = rateLimit(req, "env-rain", 20, 60_000);
  if (limited) return limited;

  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lng = Number(req.nextUrl.searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: "Valid lat/lng required" }, { status: 400 });
  }

  const now = new Date();
  const lastCompleteMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  lastCompleteMonth.setUTCDate(0);
  const startMonth = new Date(Date.UTC(lastCompleteMonth.getUTCFullYear(), lastCompleteMonth.getUTCMonth() - 11, 1));
  const iso = (date: Date) => date.toISOString().slice(0, 10);
  const start = iso(startMonth);
  const end = iso(lastCompleteMonth);
  const endExclusive = new Date(lastCompleteMonth.getTime());
  endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

  const provider = "open-meteo";
  const datasetId = "era5_archive_daily";
  const locationKey = locKey(lat, lng);
  const ttlSeconds = 7 * 24 * 3600;
  const cached = await readCached({
    provider,
    datasetId,
    parameters: ["precipitation_sum"],
    locationKey,
    from: startMonth,
    to: endExclusive,
  }, ttlSeconds, 8000);

  let rows = cached?.rows ?? [];
  let retrievedAt = cached?.retrievedAt ?? null;
  let cachedFlag = true;
  let warning: string | null = null;

  const expectedDays = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate();
  const hasFullMonthlyCoverage = (candidate: typeof rows) => {
    const counts = new Map<string, Set<string>>();
    for (const row of candidate) {
      if (row.parameter !== "precipitation_sum") continue;
      const day = new Date(row.observedAt).toISOString().slice(0, 10);
      const month = day.slice(0, 7);
      const set = counts.get(month) ?? new Set<string>();
      set.add(day);
      counts.set(month, set);
    }
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(Date.UTC(startMonth.getUTCFullYear(), startMonth.getUTCMonth() + i, 1));
      const monthKey = iso(monthDate).slice(0, 7);
      const expected = expectedDays(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1);
      if ((counts.get(monthKey)?.size ?? 0) < Math.ceil(expected * 0.9)) return false;
    }
    return true;
  };

  if (!cached?.fresh || !hasFullMonthlyCoverage(rows)) {
    try {
      const startedAt = Date.now();
      const fetched = await fetchArchiveDaily(lat, lng, start, end);
      const stored = await storeFetch(fetched);
      await logConnector(provider, "archive-rain", "ok", `stored=${stored.stored};dropped=${stored.dropped}`, Date.now() - startedAt);
      const refreshed = await readCached({ provider, datasetId, parameters: ["precipitation_sum"], locationKey, from: startMonth, to: endExclusive }, ttlSeconds, 8000);
      rows = refreshed?.rows ?? [];
      retrievedAt = refreshed?.retrievedAt ?? new Date();
      cachedFlag = false;
    } catch (error) {
      const message = error instanceof Error ? error.message : "fetch failed";
      await logConnector(provider, "archive-rain", "error", message);
      if (rows.length === 0) {
        return NextResponse.json({ error: "Precipitation provider unreachable and no cached data for this location.", detail: message }, { status: 502 });
      }
      warning = `Provider unreachable — showing cached ERA5 data. ${message}`;
    }
  }

  const buckets = new Map<string, { sum: number; days: Set<string> }>();
  for (const row of rows) {
    if (row.parameter !== "precipitation_sum") continue;
    const date = new Date(row.observedAt);
    if (date < startMonth || date >= endExclusive) continue;
    const month = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    const bucket = buckets.get(month) ?? { sum: 0, days: new Set<string>() };
    const day = date.toISOString().slice(0, 10);
    if (!bucket.days.has(day)) {
      bucket.sum += row.value;
      bucket.days.add(day);
    }
    buckets.set(month, bucket);
  }

  const monthly = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(Date.UTC(startMonth.getUTCFullYear(), startMonth.getUTCMonth() + index, 1));
    const month = iso(date).slice(0, 7);
    const expected = expectedDays(date.getUTCFullYear(), date.getUTCMonth() + 1);
    const bucket = buckets.get(month) ?? { sum: 0, days: new Set<string>() };
    const complete = bucket.days.size >= Math.ceil(expected * 0.9);
    return { month, totalMm: complete ? bucket.sum : null, daysReported: bucket.days.size, daysExpected: expected };
  });

  const allMonthsComplete = monthly.every((month) => month.totalMm !== null);
  const totalMm = allMonthsComplete ? monthly.reduce((sum, month) => sum + (month.totalMm ?? 0), 0) : null;
  const warnings: string[] = [];
  if (warning) warnings.push(warning);
  const missingMonths = monthly.filter((month) => month.totalMm === null);
  if (missingMonths.length) warnings.push(`${missingMonths.length} of 12 months did not reach 90% daily coverage; incomplete month totals and the 12-month sum are withheld.`);

  return NextResponse.json({
    location: { lat, lng },
    window: { start, end },
    monthly,
    totalMm,
    analytics: {
      methodology: "Daily ERA5 precipitation_sum values are summed per calendar month for the trailing 12 complete calendar months. A monthly total is returned only when at least 90% of expected days are present; no missing days are imputed. The 12-month total is withheld if any month fails this coverage rule.",
      warnings,
      limitations: ["ERA5 reanalysis precipitation is a model estimate; gauge data can differ, especially in complex terrain.", "A 90% completeness threshold does not guarantee the missing days were meteorologically representative."],
    },
    provenance: {
      provider,
      providerName: PROVIDER_NAMES[provider],
      datasetId,
      sourceUrl: "https://archive-api.open-meteo.com/v1/archive",
      licence: "ERA5 via Open-Meteo — free API restricted to non-commercial use, CC BY 4.0 attribution required",
      retrievedAt: retrievedAt?.toISOString() ?? null,
      cached: cachedFlag,
      ...(warnings.length ? { warning: warnings.join(" ") } : {}),
    },
  });
}
