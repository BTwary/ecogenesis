import { RainwaterHarvestingInput, DataProvenance } from '../types';
import { createProvenanceRecord } from './connectors/dataProvenanceRegistry';

const ROOF_COEFFICIENTS = {
  metal_sheet: 0.90,
  concrete_tile: 0.85,
  corrugated_asbestos: 0.80,
  tar_gravel: 0.70
};

export interface RainwaterResult {
  annualHarvestLitres: number;
  monthlyAverageLitres: number;
  householdDemandMetPercent: number; // based on typical 4-person consumption (180,000 L/yr)
  annualCostSavings: string;
  co2EmissionsAvoidedKg: number;
  suggestedSumpSizeLitres: number;
  provenance: DataProvenance;
}

export function calculateRainwaterPotential(
  input: RainwaterHarvestingInput,
  householdDemandLitresPerYear: number = 180000
): RainwaterResult {
  const runoffCoeff = ROOF_COEFFICIENTS[input.roofType] || 0.85;
  const filterEff = input.filterEfficiency || 0.85;

  // Formula: Volume (Litres) = Area (m²) × Rainfall (mm) × Runoff Coeff × Filter Efficiency
  // Note: 1 mm of rain over 1 m² = 1 Litre
  const rawLitres = input.roofAreaSqMeters * input.annualRainfallMm * runoffCoeff * filterEff;
  const annualHarvestLitres = Math.round(rawLitres);
  const monthlyAverageLitres = Math.round(annualHarvestLitres / 12);

  const householdDemandMetPercent = Math.min(100, Math.round((annualHarvestLitres / householdDemandLitresPerYear) * 100));

  // Tanker water / municipal tariff estimate: ~₹100 ($1.20) per 1,000 Litres
  const estimatedSavingsRupees = Math.round((annualHarvestLitres / 1000) * 110);
  const estimatedSavingsUSD = Math.round(estimatedSavingsRupees / 84);

  // Carbon avoided from municipal pumping, filtration, and long-distance conveyance:
  // ~0.00035 kg CO2e per Litre
  const co2AvoidedKg = Math.round(annualHarvestLitres * 0.00035);

  // Suggested sump/tank capacity: roughly 15-20 days of monsoon peak accumulation
  const suggestedSumpSizeLitres = Math.round(Math.min(25000, Math.max(3000, annualHarvestLitres * 0.08)));

  const provenance = createProvenanceRecord(
    'NWIC National Water Data Portal India',
    'CALC-RAINWATER-HYDRO-MODEL',
    'Local Catchment System',
    'Rainwater Harvesting Yield',
    'm² & mm/year',
    'Litres/year',
    'Standard hydrological catchment formula: Yield = Catchment Area × Precipitation × Runoff Coefficient × First-Flush Filter Efficiency',
    'CALCULATED_DERIVATION',
    undefined,
    'https://indiawris.gov.in',
    'Hydrological runoff coefficients calibrated according to Bureau of Indian Standards (IS 15797:2008)'
  );

  return {
    annualHarvestLitres,
    monthlyAverageLitres,
    householdDemandMetPercent,
    annualCostSavings: `₹${estimatedSavingsRupees.toLocaleString()} (~$${estimatedSavingsUSD}/yr)`,
    co2EmissionsAvoidedKg: co2AvoidedKg,
    suggestedSumpSizeLitres,
    provenance
  };
}
