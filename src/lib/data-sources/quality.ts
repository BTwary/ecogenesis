/**
 * Environmental data quality checks.
 * NEVER silently replace missing/invalid measurements with fabricated values —
 * invalid points are dropped and reported, never substituted.
 */

// Plausibility ranges per normalised parameter. Values outside are "invalid".
const RANGES: Record<string, [number, number]> = {
  pm2_5: [0, 800], // ug/m3
  pm10: [0, 1200],
  nitrogen_dioxide: [0, 500],
  sulphur_dioxide: [0, 1000],
  ozone: [0, 500],
  carbon_monoxide: [0, 50000],
  us_aqi: [0, 600],
  european_aqi: [0, 600],
  temperature_2m_max: [-90, 60], // degC
  temperature_2m_min: [-90, 60],
  precipitation_sum: [0, 1500], // mm/day
  solar_ghi: [0, 10], // kWh/m2/day (monthly mean of daily sums)
  temperature_monthly: [-45, 45], // monthly mean degC
  precipitation_monthly: [0, 3000], // mm/month
};

// Hours after which an observation is considered stale for dashboard display
export const STALENESS_HOURS: Record<string, number> = {
  pm2_5: 30,
  pm10: 30,
  us_aqi: 30,
  european_aqi: 30,
  nitrogen_dioxide: 30,
  sulphur_dioxide: 30,
  ozone: 30,
  carbon_monoxide: 30,
  precipitation_sum: 24 * 40,
  temperature_2m_max: 24 * 40,
  temperature_2m_min: 24 * 40,
};

export function validateValue(parameter: string, value: number | null | undefined): "good" | "invalid" {
  if (value === null || value === undefined || !Number.isFinite(value)) return "invalid";
  const range = RANGES[parameter];
  if (!range) return "good";
  if (value < range[0] || value > range[1]) return "invalid";
  return "good";
}

export function isStale(parameter: string, observedAt: Date, now = new Date()): boolean {
  const limit = STALENESS_HOURS[parameter];
  if (!limit) return false;
  return now.getTime() - observedAt.getTime() > limit * 3600 * 1000;
}

/** Remove duplicate points sharing the same timestamp for a parameter. */
export function dedupe<T extends { observedAt: Date; parameter: string }>(rows: T[]): T[] {
  const seen = new Set<string>();
  return rows.filter((r) => {
    const key = `${r.parameter}|${r.observedAt.getTime()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
