/**
 * Pure climatology aggregation helpers. Inputs are ERA5 daily reanalysis rows;
 * they are not station observations. Missing days/months are never filled.
 */
export interface DailyClimateObservation {
  parameter: string;
  observedAt: Date;
  value: number;
}

export interface MonthlyClimateValue {
  month: string;
  temperatureMean: number | null;
  precipitationTotal: number | null;
  temperatureDays: number;
  precipitationDays: number;
  expectedDays: number;
  temperatureCoveragePercent: number;
  precipitationCoveragePercent: number;
}

export interface ClimateSummary {
  monthsCovered: number;
  meanTemperature: number | null;
  annualPrecipitation: number | null;
  completeYears: number;
  monthOfYear: {
    month: number;
    temperature: number | null;
    precipitation: number | null;
    yearsCovered: number;
  }[];
}

const keyForDay = (d: Date) => d.toISOString().slice(0, 10);

/** Aggregate paired daily max/min temperatures and daily precipitation totals. */
export function aggregateMonthly(
  observations: DailyClimateObservation[],
  periodStart: Date,
  periodEndExclusive: Date,
): MonthlyClimateValue[] {
  const daily = new Map<string, { max: number | null; min: number | null; precipitation: number | null }>();
  for (const observation of observations) {
    const time = observation.observedAt.getTime();
    if (!Number.isFinite(time) || time < periodStart.getTime() || time >= periodEndExclusive.getTime()) continue;
    const day = keyForDay(observation.observedAt);
    const row = daily.get(day) ?? { max: null, min: null, precipitation: null };
    if (observation.parameter === "temperature_2m_max") row.max = observation.value;
    if (observation.parameter === "temperature_2m_min") row.min = observation.value;
    if (observation.parameter === "precipitation_sum") row.precipitation = observation.value;
    daily.set(day, row);
  }

  const buckets = new Map<string, { temperatureSum: number; temperatureDays: number; precipitationSum: number; precipitationDays: number }>();
  for (const [day, values] of daily) {
    const month = day.slice(0, 7);
    const bucket = buckets.get(month) ?? { temperatureSum: 0, temperatureDays: 0, precipitationSum: 0, precipitationDays: 0 };
    if (values.max !== null && values.min !== null) {
      bucket.temperatureSum += (values.max + values.min) / 2;
      bucket.temperatureDays += 1;
    }
    if (values.precipitation !== null) {
      bucket.precipitationSum += values.precipitation;
      bucket.precipitationDays += 1;
    }
    buckets.set(month, bucket);
  }

  const completeMonths: MonthlyClimateValue[] = [];
  for (
    const cursor = new Date(Date.UTC(periodStart.getUTCFullYear(), periodStart.getUTCMonth(), 1));
    cursor < periodEndExclusive;
    cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  ) {
    const month = cursor.toISOString().slice(0, 7);
    const [year, monthNumber] = month.split("-").map(Number);
    const expectedDays = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
    const b = buckets.get(month) ?? { temperatureSum: 0, temperatureDays: 0, precipitationSum: 0, precipitationDays: 0 };
    const temperatureCoveragePercent = (b.temperatureDays / expectedDays) * 100;
    const precipitationCoveragePercent = (b.precipitationDays / expectedDays) * 100;
    // A month with under 90% daily coverage is not used in climatology figures.
    const sufficientTemperature = temperatureCoveragePercent >= 90;
    const sufficientPrecipitation = precipitationCoveragePercent >= 90;
    completeMonths.push({
      month,
      temperatureMean: sufficientTemperature && b.temperatureDays ? b.temperatureSum / b.temperatureDays : null,
      precipitationTotal: sufficientPrecipitation && b.precipitationDays ? b.precipitationSum : null,
      temperatureDays: b.temperatureDays,
      precipitationDays: b.precipitationDays,
      expectedDays,
      temperatureCoveragePercent: Number(temperatureCoveragePercent.toFixed(1)),
      precipitationCoveragePercent: Number(precipitationCoveragePercent.toFixed(1)),
    });
  }
  return completeMonths;
}

/**
 * Summarise decade/month collections. Annual precipitation is the mean of
 * complete calendar-year totals, not the sum across all years. Month-of-year
 * precipitation is likewise the mean monthly total across covered years.
 */
export function summariseClimate(monthly: MonthlyClimateValue[]): ClimateSummary {
  const temperatureRows = monthly.filter((m) => m.temperatureMean !== null && m.temperatureDays > 0);
  const temperatureDayTotal = temperatureRows.reduce((s, m) => s + m.temperatureDays, 0);
  const meanTemperature = temperatureDayTotal
    ? temperatureRows.reduce((s, m) => s + (m.temperatureMean as number) * m.temperatureDays, 0) / temperatureDayTotal
    : null;

  const years = new Map<number, MonthlyClimateValue[]>();
  for (const month of monthly) {
    const year = Number(month.month.slice(0, 4));
    const rows = years.get(year) ?? [];
    rows.push(month);
    years.set(year, rows);
  }
  const completeAnnualPrecipitation: number[] = [];
  for (const rows of years.values()) {
    const byMonth = new Map(rows.map((m) => [Number(m.month.slice(5, 7)), m]));
    if (byMonth.size !== 12) continue;
    const months = [...byMonth.values()];
    if (months.every((m) => m.precipitationTotal !== null && m.precipitationCoveragePercent >= 90)) {
      completeAnnualPrecipitation.push(months.reduce((s, m) => s + (m.precipitationTotal as number), 0));
    }
  }

  const monthOfYear = Array.from({ length: 12 }, (_, i) => {
    const rows = monthly.filter((m) => Number(m.month.slice(5, 7)) === i + 1);
    const tRows = rows.filter((m) => m.temperatureMean !== null && m.temperatureDays > 0);
    const tDays = tRows.reduce((s, m) => s + m.temperatureDays, 0);
    const pRows = rows.filter((m) => m.precipitationTotal !== null && m.precipitationCoveragePercent >= 90);
    return {
      month: i + 1,
      temperature: tDays ? tRows.reduce((s, m) => s + (m.temperatureMean as number) * m.temperatureDays, 0) / tDays : null,
      precipitation: pRows.length ? pRows.reduce((s, m) => s + (m.precipitationTotal as number), 0) / pRows.length : null,
      yearsCovered: pRows.length,
    };
  });

  return {
    monthsCovered: monthly.length,
    meanTemperature,
    annualPrecipitation: completeAnnualPrecipitation.length
      ? completeAnnualPrecipitation.reduce((s, v) => s + v, 0) / completeAnnualPrecipitation.length
      : null,
    completeYears: completeAnnualPrecipitation.length,
    monthOfYear,
  };
}
