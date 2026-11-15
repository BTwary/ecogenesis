import { SolarSimulatorInput, DataProvenance } from '../types';
import { createProvenanceRecord } from './connectors/dataProvenanceRegistry';

export interface SolarSimulatorResult {
  systemSizeKw: number;
  annualGenerationKwh: number;
  annualFinancialSavings: string;
  totalSystemCost: string;
  simplePaybackYears: number;
  twentyFiveYearSavings: string;
  annualCo2AvoidedTonnes: number;
  twentyFiveYearCo2AvoidedTonnes: number;
  treesEquivalent: number;
  provenance: DataProvenance;
}

export function calculateSolarPotential(input: SolarSimulatorInput): SolarSimulatorResult {
  // Usable area: 70% of total roof accounting for parapet shadows, walkways, vents
  const usableArea = input.roofAreaSqMeters * 0.70;
  
  // Power density: Modern high-efficiency mono PERC panels are ~200 - 210 Wp/m² (0.20 kW/m²)
  const systemSizeKw = Number(Math.max(1.0, (usableArea * (input.panelEfficiencyPercent / 100))).toFixed(1));

  // Annual Generation:
  // kWh/year = System kW × Daily Peak Sun Hours (GHI) × 365 × Performance Ratio (system loss factor e.g. 0.78)
  const annualGenerationKwh = Math.round(
    systemSizeKw * input.solarIrradianceKwhM2Day * 365 * input.systemLossFactor
  );

  // System Cost (assume typical turnkey rooftop solar: ~$1.10 / Watt or ~₹55,000 / kW in India)
  const totalCostVal = systemSizeKw * input.costPerWattInstalled * 1000;
  
  // Annual Electricity bill savings
  const annualSavingsVal = annualGenerationKwh * input.gridTariffPerKwh;

  const simplePaybackYears = annualSavingsVal > 0 
    ? Number((totalCostVal / annualSavingsVal).toFixed(1)) 
    : 0;

  // 25-year cumulative savings with 0.5%/year panel degradation
  let cumulative25 = 0;
  for (let y = 1; y <= 25; y++) {
    const deg = Math.pow(0.995, y - 1);
    cumulative25 += annualSavingsVal * deg;
  }
  const net25YearSavings = Math.round(cumulative25 - totalCostVal);

  // Environmental impact: Grid emission factor (0.713 kg/kWh India baseline)
  const annualCo2AvoidedTonnes = Number(((annualGenerationKwh * 0.713) / 1000).toFixed(1));
  const twentyFiveYearCo2AvoidedTonnes = Number((annualCo2AvoidedTonnes * 23.5).toFixed(1));
  // 1 mature tree absorbs ~22 kg CO2 / year
  const treesEquivalent = Math.round((annualCo2AvoidedTonnes * 1000) / 22);

  const provenance = createProvenanceRecord(
    'NASA POWER',
    'SOLAR-PHOTOVOLTAIC-SIMULATION-PVWATTS-MODEL',
    'Rooftop Location',
    'Photovoltaic Generation & Avoided Grid Carbon',
    'm² & kWh/m²/day',
    'kWp, kWh/year & Payback Years',
    'NREL PVWatts v8 calculation model incorporating GHI irradiance, temperature derate, and inverter efficiency',
    'CALCULATED_DERIVATION',
    undefined,
    'https://power.larc.nasa.gov',
    'Assumes 0.5% annual module degradation rate and 0.78 balance-of-system performance ratio'
  );

  return {
    systemSizeKw,
    annualGenerationKwh,
    annualFinancialSavings: `$${Math.round(annualSavingsVal).toLocaleString()} (~₹${Math.round(annualSavingsVal * 84).toLocaleString()})/yr`,
    totalSystemCost: `$${Math.round(totalCostVal).toLocaleString()} (~₹${Math.round(totalCostVal * 84).toLocaleString()})`,
    simplePaybackYears,
    twentyFiveYearSavings: `$${net25YearSavings.toLocaleString()} (~₹${(net25YearSavings * 84).toLocaleString()})`,
    annualCo2AvoidedTonnes,
    twentyFiveYearCo2AvoidedTonnes,
    treesEquivalent,
    provenance
  };
}

export interface RenewableTechnologyInfo {
  name: string;
  category: 'Solar' | 'Wind' | 'Hydro' | 'Geothermal' | 'Biomass' | 'Battery Storage';
  technologyOverview: string;
  levelizedCostOfEnergy: string; // LCOE ($/MWh)
  efficiencyRange: string;
  idealApplication: string;
  environmentalBenefits: string;
  regionalLimitations: string;
}

export const RENEWABLE_TECHNOLOGIES: RenewableTechnologyInfo[] = [
  {
    name: 'Rooftop & Utility Photovoltaics (PV)',
    category: 'Solar',
    technologyOverview: 'Solid-state semiconductor cells that convert incoming photons directly into direct current (DC) electricity via the photoelectric effect.',
    levelizedCostOfEnergy: '$30 - $55 / MWh (₹2.4 - ₹3.8 / kWh)',
    efficiencyRange: '19% - 23% (Monocrystalline Silicon)',
    idealApplication: 'Residential roofs, commercial warehouses, parking canopies, arid solar farms.',
    environmentalBenefits: 'Zero operational carbon emissions; saves 700 - 800 kg CO2e per MWh in coal-heavy grids.',
    regionalLimitations: 'Intermittent diurnal generation; requires grid net-metering or battery storage for night load.'
  },
  {
    name: 'Distributed & Utility Wind Turbines',
    category: 'Wind',
    technologyOverview: 'Aerodynamic rotor blades harness kinetic energy from atmospheric wind flow, driving an induction generator to generate alternating current.',
    levelizedCostOfEnergy: '$28 - $48 / MWh',
    efficiencyRange: '35% - 48% (Betz theoretical limit: 59.3%)',
    idealApplication: 'Coastal zones, open ridgelines, offshore waters, agricultural co-locations.',
    environmentalBenefits: 'Lowest life-cycle emissions of any utility generation source (~11 g CO2e / kWh).',
    regionalLimitations: 'Requires consistent mean wind speeds (>5.5 m/s); acoustic and radar restrictions near urban density.'
  },
  {
    name: 'Micro-Hydro & Run-of-River Systems',
    category: 'Hydro',
    technologyOverview: 'Utilizes hydraulic head and natural river flow volume without extensive damming or flooding, driving Pelton or Kaplan hydraulic turbines.',
    levelizedCostOfEnergy: '$35 - $65 / MWh',
    efficiencyRange: '80% - 90%',
    idealApplication: 'Hilly and mountainous terrain with perennial natural stream flow.',
    environmentalBenefits: 'Consistent baseload generation; leaves natural riverbed sedimentation and aquatic corridors largely intact.',
    regionalLimitations: 'Dependent on seasonal monsoon hydrology; requires localized topographic elevation drop.'
  },
  {
    name: 'Geothermal Heat Pumps & Deep Wells',
    category: 'Geothermal',
    technologyOverview: 'Harnesses constant subterranean Earth temperatures via closed-loop ground heat exchangers for heating/cooling, or deep hydrothermal steam for electric turbines.',
    levelizedCostOfEnergy: '$55 - $95 / MWh',
    efficiencyRange: 'Coefficient of Performance (COP) 3.5 - 5.0 for heat pumps',
    idealApplication: 'Commercial building thermal conditioning, district heating, volcanic/tectonic rift regions.',
    environmentalBenefits: 'Continuous 24/7/365 baseload with near-zero land surface disturbance.',
    regionalLimitations: 'High initial exploratory drilling capital expense; geographically constrained deep steam reserves.'
  },
  {
    name: 'Anaerobic Biomass & Biogas Digestion',
    category: 'Biomass',
    technologyOverview: 'Microbiological anaerobic digestion of agricultural crop residues, food waste, or cattle manure, yielding biogas (55–65% CH4) and bio-slurry fertilizer.',
    levelizedCostOfEnergy: '$60 - $110 / MWh',
    efficiencyRange: '30% - 38% electrical conversion (CHP up to 75% thermal)',
    idealApplication: 'Agricultural cooperatives, food processing plants, dairy farms, rural micro-grids.',
    environmentalBenefits: 'Captures fugitive methane from manure and crop stubble burning, displacing coal and synthetic nitrogen fertilizer.',
    regionalLimitations: 'Requires continuous steady biomass feedstock supply and feedstock transport logistics.'
  },
  {
    name: 'Lithium Iron Phosphate (LFP) Battery Energy Storage',
    category: 'Battery Storage',
    technologyOverview: 'High-density electrochemical cells that store surplus daytime solar or off-peak wind energy to discharge during peak evening tariff windows.',
    levelizedCostOfEnergy: '$90 - $140 / MWh (levelized storage cost)',
    efficiencyRange: '86% - 92% Round-Trip Efficiency (RTE)',
    idealApplication: 'Commercial demand-charge shaving, residential backup power, grid frequency regulation.',
    environmentalBenefits: 'Enables 100% renewable utilization by eliminating fossil peaker plant dispatch.',
    regionalLimitations: 'Mineral extraction supply chains; requires thermal management in extreme desert climates.'
  }
];
