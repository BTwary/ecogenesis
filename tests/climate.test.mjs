import test from 'node:test';
import assert from 'node:assert/strict';
import { aggregateMonthly, summariseClimate } from '../src/lib/data-sources/climate.ts';

const utc = (iso) => new Date(`${iso}T12:00:00.000Z`);

test('monthly temperature uses paired daily max/min and precipitation totals', () => {
  const rows = [];
  for (let day = 1; day <= 31; day += 1) {
    const date = `2024-01-${String(day).padStart(2, '0')}`;
    rows.push(
      { parameter: 'temperature_2m_max', observedAt: utc(date), value: 20 },
      { parameter: 'temperature_2m_min', observedAt: utc(date), value: 10 },
      { parameter: 'precipitation_sum', observedAt: utc(date), value: 2 },
    );
  }
  const [month] = aggregateMonthly(rows, utc('2024-01-01'), utc('2024-02-01'));
  assert.equal(month.temperatureMean, 15);
  assert.equal(month.precipitationTotal, 62);
  assert.equal(month.temperatureCoveragePercent, 100);
  assert.equal(month.precipitationCoveragePercent, 100);
});

test('months below 90% coverage are withheld rather than imputed', () => {
  const rows = [];
  for (let day = 1; day <= 25; day += 1) {
    const date = `2023-02-${String(day).padStart(2, '0')}`;
    rows.push(
      { parameter: 'temperature_2m_max', observedAt: utc(date), value: 20 },
      { parameter: 'temperature_2m_min', observedAt: utc(date), value: 10 },
      { parameter: 'precipitation_sum', observedAt: utc(date), value: 1 },
    );
  }
  const [month] = aggregateMonthly(rows, utc('2023-02-01'), utc('2023-03-01'));
  assert.equal(month.temperatureMean, null);
  assert.equal(month.precipitationTotal, null);
});

test('annual precipitation is averaged across complete years, not summed across decades', () => {
  const monthly = [];
  for (const [year, monthlyRain, temperature] of [[2020, 100, 10], [2021, 200, 20]]) {
    for (let month = 1; month <= 12; month += 1) {
      monthly.push({
        month: `${year}-${String(month).padStart(2, '0')}`,
        temperatureMean: temperature,
        precipitationTotal: monthlyRain,
        temperatureDays: 30,
        precipitationDays: 30,
        expectedDays: 30,
        temperatureCoveragePercent: 100,
        precipitationCoveragePercent: 100,
      });
    }
  }
  const summary = summariseClimate(monthly);
  assert.equal(summary.completeYears, 2);
  assert.equal(summary.annualPrecipitation, 1800);
  assert.equal(summary.monthOfYear[0].precipitation, 150);
  assert.equal(summary.meanTemperature, 15);
});


test('months with no returned observations remain explicit zero-coverage gaps', () => {
  const rows = [
    { parameter: 'temperature_2m_max', observedAt: utc('2024-01-01'), value: 20 },
    { parameter: 'temperature_2m_min', observedAt: utc('2024-01-01'), value: 10 },
  ];
  const months = aggregateMonthly(rows, utc('2024-01-01'), new Date('2024-03-01T00:00:00.000Z'));
  assert.deepEqual(months.map((month) => month.month), ['2024-01', '2024-02']);
  assert.equal(months[1].temperatureMean, null);
  assert.equal(months[1].precipitationTotal, null);
  assert.equal(months[1].temperatureCoveragePercent, 0);
});
