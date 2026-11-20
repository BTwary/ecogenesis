import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFootprint } from '../src/lib/factors.ts';
import { resolveFootprintRecord } from '../src/lib/footprint-record.ts';

const base = {
  carType: 'none', carKmWeek: 0, twoWheelerKmWeek: 0, busKmWeek: 0, trainKmWeek: 0,
  shortFlightsYear: 0, longFlightsYear: 0,
  electricityKwhMonth: 100, grid: 'india', customGridFactor: 0.713,
  lpgCylindersMonth: 0, pngKwhMonth: 0,
  diet: 'vegan', foodWaste: 'low',
  clothingItemsYear: 0, phonesYear: 0, laptopsYear: 0,
  landfillKgWeek: 0, recycledKgWeek: 0, compostedKgWeek: 0,
  waterLitresDay: 100, householdSize: 1,
};
const category = (result, key) => result.categories.find((item) => item.key === key).kgCo2e;

test('only shared household categories are allocated across occupants', () => {
  const one = calculateFootprint({ ...base, householdSize: 1 });
  const four = calculateFootprint({ ...base, householdSize: 4 });
  assert.equal(category(four, 'energy'), category(one, 'energy') / 4);
  assert.equal(category(four, 'water'), category(one, 'water') / 4);
  assert.equal(category(four, 'food'), category(one, 'food'));
  assert.equal(category(four, 'transport'), category(one, 'transport'));
  assert.equal(category(four, 'goods'), category(one, 'goods'));
  assert.ok(Math.abs(four.totalKg - four.categories.reduce((sum, item) => sum + item.kgCo2e, 0)) < 1e-9);
});

test('custom grid factor is snapshotted once and included in factors used', () => {
  const result = calculateFootprint({ ...base, grid: 'custom', customGridFactor: 0.52, carType: 'ev', carKmWeek: 20 });
  const custom = result.factorsUsed.filter((factor) => factor.key === 'grid_custom');
  assert.equal(custom.length, 1);
  assert.equal(custom[0].value, 0.52);
});

test('household size is bounded to a positive integer', () => {
  const result = calculateFootprint({ ...base, householdSize: 0 });
  assert.equal(result.householdSize, 1);
});




test('legacy history is reallocated using its original factor snapshot', () => {
  const originalFactors = [
    { key: 'car_petrol', value: 0.2, unit: 'kgCO2e/km', source: 'historical factor', confidence: 'published' },
    { key: 'grid_india', value: 0.6, unit: 'kgCO2e/kWh', source: 'historical grid factor', confidence: 'published' },
    { key: 'diet_vegan', value: 3.1, unit: 'tCO2e/year', source: 'historical diet factor', confidence: 'published' },
  ];
  const inputs = { ...base, carType: 'petrol', carKmWeek: 10, householdSize: 2, electricityKwhMonth: 100 };
  const corrected = calculateFootprint(inputs, originalFactors);
  const record = resolveFootprintRecord({
    id: 'legacy-1',
    inputs: JSON.stringify(inputs),
    factorsJson: JSON.stringify(originalFactors),
    totalKgCo2e: 9999, // Prior result is intentionally wrong under the old allocation rule.
    categories: '[]',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
  });
  assert.equal(record.recalculatedForAllocation, true);
  assert.equal(record.factorSnapshotAvailable, true);
  assert.equal(record.totalKgCo2e, corrected.totalKg);
  assert.equal(record.categories.find((item) => item.key === 'transport').kgCo2e, corrected.categories.find((item) => item.key === 'transport').kgCo2e);
});
