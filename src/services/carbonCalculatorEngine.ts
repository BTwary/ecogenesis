import { 
  FootprintInput, 
  FootprintResult, 
  DataProvenance,
  ApplianceAuditDetails,
  CookingAuditDetails,
  ShoppingPlasticsAuditDetails
} from '../types';
import { createProvenanceRecord } from './connectors/dataProvenanceRegistry';
import { INDIA_CITIES_DATABASE } from './indiaCitiesDatabase';
import { NDC_DATABASE, CountryNDC } from './ndcDatabase';

// Sub-Regional Spatial Benchmarks & Carbon Intensities
export interface SubRegionBenchmark {
  id: string;
  name: string;
  country: string;
  perCapitaTonnes: number;
  gridCarbonIntensity: number; // kg CO2/kWh
  primaryEnergySource: string;
}

export const LOCAL_SUBREGION_BENCHMARKS: Record<string, SubRegionBenchmark> = {};

// 1. Register all Indian State & UT Capitals, Tier 2, and Tier 3 Cities
INDIA_CITIES_DATABASE.forEach(city => {
  LOCAL_SUBREGION_BENCHMARKS[city.id] = {
    id: city.id,
    name: `${city.name}, ${city.stateOrUT} (${city.type})`,
    country: 'India',
    perCapitaTonnes: city.perCapitaTonnes,
    gridCarbonIntensity: city.gridCarbonIntensity,
    primaryEnergySource: `${city.gridRegion} · ${city.riverBasin}`
  };
});

// Backward-compatibility keys for India
LOCAL_SUBREGION_BENCHMARKS['Delhi_NCR'] = LOCAL_SUBREGION_BENCHMARKS['in-dl-delhi'];
LOCAL_SUBREGION_BENCHMARKS['Maharashtra_Mumbai'] = LOCAL_SUBREGION_BENCHMARKS['in-mh-mumbai'];
LOCAL_SUBREGION_BENCHMARKS['Karnataka_Bengaluru'] = LOCAL_SUBREGION_BENCHMARKS['in-ka-bengaluru'];
LOCAL_SUBREGION_BENCHMARKS['TamilNadu_Chennai'] = LOCAL_SUBREGION_BENCHMARKS['in-tn-chennai'];

// 2. Register all international sub-regions from NDC_DATABASE (US, EU, UK, JP, BR, AU)
Object.values(NDC_DATABASE).forEach(country => {
  country.subRegions.forEach(sr => {
    LOCAL_SUBREGION_BENCHMARKS[sr.id] = {
      id: sr.id,
      name: `${sr.name} (${country.name})`,
      country: country.name,
      perCapitaTonnes: sr.perCapitaTonnes,
      gridCarbonIntensity: sr.gridCarbonIntensity,
      primaryEnergySource: sr.description
    };
  });
});

// Backward-compatibility keys for US & UK
LOCAL_SUBREGION_BENCHMARKS['California_BayArea'] = LOCAL_SUBREGION_BENCHMARKS['us-ca-bayarea'];
LOCAL_SUBREGION_BENCHMARKS['UK_London'] = LOCAL_SUBREGION_BENCHMARKS['uk-eng-london'];

// Emission Factors (kg CO2e per unit) from IPCC AR6, UK DEFRA 2023, US EPA eGRID, and CEA India
export const EMISSION_FACTORS = {
  electricityKwh: {
    India_National: 0.713,  // CEA India Baseline Database v19
    US_Average: 0.386,      // US EPA eGRID
    EU_Average: 0.231,      // European Environment Agency
    Global_Average: 0.436   // IEA World Average
  },
  transportKm: {
    petrol: 0.192,
    diesel: 0.171,
    hybrid: 0.109,
    ev: 0.055, // life-cycle grid average
    publicTransit: 0.045
  },
  flightsPerKm: {
    shortHaul: 0.155 * 800,      // ~124 kg CO2e per flight average
    longHaul: 0.102 * 4500 * 1.9 // with radiative forcing index ~872 kg CO2e
  },
  lpgKg: 2.98,
  pngScm: 2.02,
  dietPerYearKg: {
    heavy_meat: 3300,
    medium_meat: 2500,
    pescatarian: 1900,
    vegetarian: 1500,
    vegan: 1000
  },
  wasteBagKg: 14.2, // ~14.2 kg CO2e per weekly landfill bag over lifecycle
  waterPerLitre: 0.00035, // water pumping, distribution & aeration
  shoppingPerYearKg: {
    minimal: 500,
    moderate: 1200,
    high: 2800
  },
  // Polymer-specific plastic emission factors (kg CO2e per kg plastic resin)
  plasticsKg: {
    pet: 2.15,   // #1 PET (bottles)
    hdpe: 1.90,  // #2 HDPE (shampoo, milk containers)
    ldpe: 2.08,  // #4 LDPE (thin carry bags, wraps)
    pp: 1.95,    // #5 PP (takeaway boxes, tupperware)
    mlp: 3.20    // #7 Multi-layer packaging (chips packets, sachets)
  },
  fastFashionGarmentKg: 18.5,
  gadgetDeviceKg: 75.0
};

export const NATIONAL_BENCHMARKS = {
  India_National: 1.9,  // Tonnes per capita / year (World Bank / IEA)
  US_Average: 14.8,     // Tonnes per capita
  EU_Average: 6.8,      // Tonnes per capita
  Global_Average: 4.7,  // Tonnes per capita
  ParisTarget2030: 2.0  // IPCC 1.5°C Paris Agreement pathway
};

export function calculateCarbonFootprint(input: FootprintInput): FootprintResult {
  const activeCountry = input.countryCode ? NDC_DATABASE[input.countryCode] : NDC_DATABASE['IN'];

  // 1. Resolve sub-region spatial benchmark and grid carbon factor
  let localBenchmarkVal: number | undefined = undefined;
  let customGridFactor: number | undefined = undefined;

  if (input.subRegion && LOCAL_SUBREGION_BENCHMARKS[input.subRegion]) {
    const sub = LOCAL_SUBREGION_BENCHMARKS[input.subRegion];
    localBenchmarkVal = sub.perCapitaTonnes;
    customGridFactor = sub.gridCarbonIntensity;
  }

  const defaultGrid = activeCountry 
    ? activeCountry.nationalGridCarbonIntensity 
    : (EMISSION_FACTORS.electricityKwh[input.gridRegion] || EMISSION_FACTORS.electricityKwh.India_National);
  
  const gridFactor = customGridFactor !== undefined ? customGridFactor : defaultGrid;

  // 2. Transport Emissions
  const carFactor = EMISSION_FACTORS.transportKm[input.carFuelType] || EMISSION_FACTORS.transportKm.petrol;
  const annualCarEmissionsKg = input.carKmPerWeek * 52 * carFactor;
  const annualTransitEmissionsKg = input.publicTransitKmPerWeek * 52 * EMISSION_FACTORS.transportKm.publicTransit;
  const flightEmissionsKg = (input.flightsShortHaulPerYear * EMISSION_FACTORS.flightsPerKm.shortHaul) +
                            (input.flightsLongHaulPerYear * EMISSION_FACTORS.flightsPerKm.longHaul);
  const transportTotalTonnes = (annualCarEmissionsKg + annualTransitEmissionsKg + flightEmissionsKg) / 1000;

  // 3. Elementary Appliance Electricity Disaggregation
  let applianceDetails: ApplianceAuditDetails | undefined = undefined;
  let computedElectricityKwh = input.electricityKwhPerMonth;

  if (input.applianceElectricity) {
    const ae = input.applianceElectricity;
    // AC Calculation: 1.0T (1.0kW), 1.5T (1.5kW), 2.0T (2.0kW)
    const starMultipliers: Record<number, number> = { 1: 1.25, 2: 1.10, 3: 1.00, 4: 0.88, 5: 0.72 };
    const starMult = starMultipliers[ae.airConditioning.starRating] || 1.0;
    const acRatedKw = ae.airConditioning.tons * 1.0;
    const acAnnualKwh = ae.airConditioning.count * acRatedKw * starMult * ae.airConditioning.hoursPerDaySummer * 30.5 * ae.airConditioning.monthsPerYear;
    const acKwhPerMonth = Math.round(acAnnualKwh / 12);
    const acAnnualTonnesCO2 = Number(((acAnnualKwh * gridFactor) / 1000).toFixed(2));

    // Water Geyser
    const geyserKw = ae.waterGeyser.type === 'solar_thermal' ? 0.05 : (ae.waterGeyser.type === 'instant_electric' ? 3.0 : 2.0);
    const geyserAnnualKwh = (ae.waterGeyser.minutesPerDay / 60) * geyserKw * 365;
    const geyserKwhPerMonth = Math.round(geyserAnnualKwh / 12);

    // Refrigerator
    const fridgeAnnualKwh = ae.refrigerator.type === 'single_door_5star' ? 180 : (ae.refrigerator.type === 'double_door_frost_free' ? 330 : 550);
    const refrigeratorKwhPerMonth = Math.round(fridgeAnnualKwh / 12);

    // Fans & Lighting
    const fanWatts = ae.fansAndLighting.ceilingFanType === 'bldc_energy_saver_28w' ? 28 : 75;
    const fansAnnualKwh = (4 * fanWatts * 10 * 365) / 1000;
    const ledRatio = ae.fansAndLighting.ledLightingRatioPercent / 100;
    const avgBulbWatts = (9 * ledRatio) + (40 * (1 - ledRatio));
    const lightingAnnualKwh = (6 * avgBulbWatts * 5 * 365) / 1000;
    const fansAndLightingKwhPerMonth = Math.round((fansAnnualKwh + lightingAnnualKwh) / 12);

    const totalDisaggregatedKwhPerMonth = acKwhPerMonth + geyserKwhPerMonth + refrigeratorKwhPerMonth + fansAndLightingKwhPerMonth;

    applianceDetails = {
      acKwhPerMonth,
      geyserKwhPerMonth,
      refrigeratorKwhPerMonth,
      fansAndLightingKwhPerMonth,
      totalDisaggregatedKwhPerMonth,
      acAnnualTonnesCO2
    };

    // Disaggregated appliance load provides dynamic deterministic electricity calculation
    if (totalDisaggregatedKwhPerMonth > 0) {
      computedElectricityKwh = totalDisaggregatedKwhPerMonth + 30; // base plugs + small electronics
    }
  }

  const electricityTonnes = (computedElectricityKwh * 12 * gridFactor) / 1000;

  // 4. Cooking Fuel Suitability (India LPG cylinders vs PNG vs Induction)
  let cookingDetails: CookingAuditDetails | undefined = undefined;
  let householdEnergyTonnes = 0;

  if (input.cookingFuelSuitability) {
    const cs = input.cookingFuelSuitability;
    let cookingAnnualKgCO2 = 0;
    let cylindersUsed = 0;

    if (cs.fuelMode === 'lpg_14kg_cylinder') {
      const durationDays = cs.lpgCylinderDaysDuration && cs.lpgCylinderDaysDuration > 0 ? cs.lpgCylinderDaysDuration : 45;
      cylindersUsed = Number((365 / durationDays).toFixed(1));
      const totalLpgKg = cylindersUsed * 14.2;
      cookingAnnualKgCO2 = totalLpgKg * EMISSION_FACTORS.lpgKg;
      householdEnergyTonnes = cookingAnnualKgCO2 / 1000;
    } else if (cs.fuelMode === 'lpg_19kg_commercial') {
      cylindersUsed = 12; // 1 commercial cylinder / month baseline
      const totalLpgKg = cylindersUsed * 19.0;
      cookingAnnualKgCO2 = totalLpgKg * EMISSION_FACTORS.lpgKg;
      householdEnergyTonnes = cookingAnnualKgCO2 / 1000;
    } else if (cs.fuelMode === 'png_piped_gas') {
      const scmMonthly = cs.pngScmPerMonth || 18;
      cookingAnnualKgCO2 = scmMonthly * 12 * EMISSION_FACTORS.pngScm;
      householdEnergyTonnes = cookingAnnualKgCO2 / 1000;
    } else if (cs.fuelMode === 'electric_induction') {
      // 100% Induction: zero direct combustion!
      cookingAnnualKgCO2 = 0;
      householdEnergyTonnes = 0;
    }

    // Induction comparison physics:
    // 14.2 kg LPG yields ~72.7 kWh useful heat at 40% flame efficiency.
    // Induction stove delivers 84% thermal efficiency, consuming ~86.5 kWh per cylinder equivalent.
    const cylindersBenchmark = cylindersUsed > 0 ? cylindersUsed : 8.5;
    const inductionAnnualKwhNeeded = Math.round(cylindersBenchmark * 86.5);
    const inductionAnnualCarbonTonnes = Number(((inductionAnnualKwhNeeded * gridFactor) / 1000).toFixed(2));
    const cookingCarbonTonnes = Number((cookingAnnualKgCO2 / 1000).toFixed(2));
    const transitionSavingsTonnes = Number(Math.max(0, cookingCarbonTonnes - inductionAnnualCarbonTonnes).toFixed(2));

    const currency = activeCountry ? activeCountry.currencySymbol : '₹';
    const costSavings = activeCountry?.code === 'IN' 
      ? `Switching to induction saves ~₹${Math.round(cylindersBenchmark * 850 - inductionAnnualKwhNeeded * 7).toLocaleString()}/yr`
      : `Induction delivers 84% thermal efficiency vs 40% open gas combustion`;

    cookingDetails = {
      fuelMode: cs.fuelMode,
      annualLpgCylinders: cylindersUsed > 0 ? cylindersUsed : undefined,
      cookingCarbonTonnes,
      inductionAnnualKwhNeeded,
      inductionAnnualCarbonTonnes,
      transitionSavingsTonnes,
      costSavingsComparison: costSavings
    };
  } else {
    householdEnergyTonnes = (input.cookingGasCylindersOrKgPerMonth * 12 * 14.2 * EMISSION_FACTORS.lpgKg) / 1000;
  }

  // 5. Food & Diet
  const baseDietKg = EMISSION_FACTORS.dietPerYearKg[input.dietType] || 2000;
  const foodTonnes = (baseDietKg * (1 - (input.localFoodPercentage / 100) * 0.10)) / 1000;

  // 6. Granular Shopping, Fashion & Plastics Decomposition
  let plasticDetails: ShoppingPlasticsAuditDetails | undefined = undefined;
  let shoppingTonnes = 0;

  if (input.shoppingPlasticsGranular) {
    const sp = input.shoppingPlasticsGranular;
    const petKg = Number((sp.petBottlesWeekly * 52 * 0.025).toFixed(2));
    const hdpeKg = Number((sp.hdpeBottlesMonthly * 12 * 0.050).toFixed(2));
    const ldpeKg = Number((sp.ldpeBagsWeekly * 52 * 0.008).toFixed(2));
    const ppKg = Number((sp.ppTakeawayContainersWeekly * 52 * 0.035).toFixed(2));
    const mlpKg = Number((sp.mlpSnackPacketsWeekly * 52 * 0.015).toFixed(2));

    const totalPlasticKgPerYear = Number((petKg + hdpeKg + ldpeKg + ppKg + mlpKg).toFixed(1));
    const plasticKgCO2 = (petKg * EMISSION_FACTORS.plasticsKg.pet) +
                         (hdpeKg * EMISSION_FACTORS.plasticsKg.hdpe) +
                         (ldpeKg * EMISSION_FACTORS.plasticsKg.ldpe) +
                         (ppKg * EMISSION_FACTORS.plasticsKg.pp) +
                         (mlpKg * EMISSION_FACTORS.plasticsKg.mlp);
    const plasticCarbonTonnes = Number((plasticKgCO2 / 1000).toFixed(2));

    const fastFashionTonnes = Number(((sp.fastFashionGarmentsPerYear * EMISSION_FACTORS.fastFashionGarmentKg) / 1000).toFixed(2));
    const electronicsTonnes = Number(((sp.electronicsGadgetsPerYear * EMISSION_FACTORS.gadgetDeviceKg) / 1000).toFixed(2));

    // Mechanically recyclable: PET (#1), HDPE (#2), PP (#5)
    const recyclableKg = petKg + hdpeKg + ppKg;
    const recyclableSharePercent = totalPlasticKgPerYear > 0 ? Math.round((recyclableKg / totalPlasticKgPerYear) * 100) : 50;

    // Base consumer goods lifecycle: minimal (0.3t), moderate (0.6t), high (1.4t)
    const baseGoodsTonnes = sp.frequency === 'minimalist' ? 0.25 : (sp.frequency === 'monthly' ? 0.45 : (sp.frequency === 'biweekly' ? 0.70 : 1.10));
    shoppingTonnes = Number((plasticCarbonTonnes + fastFashionTonnes + electronicsTonnes + baseGoodsTonnes).toFixed(2));

    plasticDetails = {
      totalPlasticKgPerYear,
      petBottlesKg: petKg,
      hdpeContainersKg: hdpeKg,
      ldpeBagsKg: ldpeKg,
      ppContainersKg: ppKg,
      mlpPacketsKg: mlpKg,
      plasticCarbonTonnes,
      fastFashionTonnes,
      recyclableSharePercent
    };
  } else {
    shoppingTonnes = (EMISSION_FACTORS.shoppingPerYearKg[input.shoppingExpenditureLevel] || 1200) / 1000;
  }

  // 7. Waste
  const grossWasteKg = input.wasteBagsPerWeek * 52 * EMISSION_FACTORS.wasteBagKg;
  const wasteTonnes = (grossWasteKg * (1 - (input.recyclingRate / 100) * 0.55)) / 1000;

  // 8. Water
  const waterTonnes = (input.waterLitresPerDay * 365 * EMISSION_FACTORS.waterPerLitre) / 1000;

  // 9. Digital Devices & Technology Telemetry
  let digitalDevicesTonnes = 0;
  if (input.deviceUsage) {
    const du = input.deviceUsage;
    const phoneKwh = du.smartphoneHoursPerDay * 365 * 0.005;
    const laptopKwh = du.laptopPcHoursPerDay * 365 * 0.045;
    const tvKwh = du.tvStreamingHoursPerDay * 365 * 0.085;
    const cloudStreamingKg = du.dailyDataStreamingGb * 365 * 0.018;
    const standbyKwh = (du.standbyDevicesCount * 5 * 24 * 365) / 1000;
    const deviceElectricityKg = (phoneKwh + laptopKwh + tvKwh + standbyKwh) * gridFactor;
    const embodiedHardwareKg = 24.0;
    digitalDevicesTonnes = Number(((deviceElectricityKg + cloudStreamingKg + embodiedHardwareKg) / 1000).toFixed(2));
  }

  // Business Scopes if provided
  let scope1Direct = 0;
  let scope2Indirect = 0;
  let scope3SupplyChain = 0;

  if (input.scope1DirectFuelLitres !== undefined) {
    scope1Direct = (input.scope1DirectFuelLitres * 2.68) / 1000;
  }
  if (input.scope2FacilityKwh !== undefined) {
    scope2Indirect = (input.scope2FacilityKwh * gridFactor) / 1000;
  }
  if (input.scope3SupplyChainTonnes !== undefined) {
    scope3SupplyChain = input.scope3SupplyChainTonnes;
  }

  // Explicit audit mode: enterprise scopes vs personal lifestyle
  const isBusiness = input.auditMode === 'enterprise_scopes';

  let totalCarbonTonnes = 0;
  if (isBusiness) {
    totalCarbonTonnes = Number((scope1Direct + scope2Indirect + scope3SupplyChain).toFixed(2));
  } else {
    totalCarbonTonnes = Number((
      transportTotalTonnes + 
      electricityTonnes + 
      householdEnergyTonnes + 
      foodTonnes + 
      shoppingTonnes + 
      wasteTonnes + 
      waterTonnes +
      digitalDevicesTonnes
    ).toFixed(2));
  }

  // Find largest contributor
  const categoryMap: Record<string, number> = isBusiness ? {
    'Scope 1 (Direct Combustion)': scope1Direct,
    'Scope 2 (Purchased Electricity)': scope2Indirect,
    'Scope 3 (Value Chain)': scope3SupplyChain
  } : {
    'Transportation': transportTotalTonnes,
    'Electricity': electricityTonnes,
    'Household Cooking/Gas': householdEnergyTonnes,
    'Food & Diet': foodTonnes,
    'Goods & Shopping': shoppingTonnes,
    'Waste Generation': wasteTonnes,
    'Water Usage': waterTonnes,
    'Digital Devices & Cloud': digitalDevicesTonnes
  };

  let largestContributor = 'Transportation';
  let maxVal = -1;
  for (const [cat, val] of Object.entries(categoryMap)) {
    if (val > maxVal) {
      maxVal = val;
      largestContributor = cat;
    }
  }

  // Country & Sub-Regional Benchmark Comparison
  const nationalBenchmarkVal = activeCountry 
    ? activeCountry.nationalPerCapitaBaseline 
    : (NATIONAL_BENCHMARKS[input.gridRegion] || NATIONAL_BENCHMARKS.India_National);
  
  const comparisonBaseline = localBenchmarkVal !== undefined ? localBenchmarkVal : nationalBenchmarkVal;
  const percentDiffVsBenchmark = Math.round(((totalCarbonTonnes - comparisonBaseline) / comparisonBaseline) * 100);

  // Currency prefix for tailored cost savings
  const curr = activeCountry ? activeCountry.currencySymbol : '₹';

  // Reduction opportunities
  const opportunities = [];
  if (applianceDetails && applianceDetails.acAnnualTonnesCO2 > 0.8) {
    opportunities.push({
      action: 'Upgrade to 5-Star Inverter AC & Set Thermostat to 24°C',
      potentialReductionTonnes: Number((applianceDetails.acAnnualTonnesCO2 * 0.30).toFixed(2)),
      difficulty: 'Easy' as const,
      annualCostDelta: `Save ${curr}6,500 - ${curr}15,000/yr on power bills`
    });
  }
  if (cookingDetails && cookingDetails.transitionSavingsTonnes > 0.15) {
    opportunities.push({
      action: 'Transition from LPG Cylinder to Induction Cooktop (84% Efficiency)',
      potentialReductionTonnes: cookingDetails.transitionSavingsTonnes,
      difficulty: 'Easy' as const,
      annualCostDelta: cookingDetails.costSavingsComparison
    });
  }
  if (plasticDetails && plasticDetails.totalPlasticKgPerYear > 20) {
    opportunities.push({
      action: 'Eliminate Single-Use PET Bottles & Multi-Layer Plastic Packaging',
      potentialReductionTonnes: Number((plasticDetails.plasticCarbonTonnes * 0.65).toFixed(2)),
      difficulty: 'Easy' as const,
      annualCostDelta: `Eliminate ${Math.round(plasticDetails.totalPlasticKgPerYear * 0.6)} kg plastic waste from landfills`
    });
  }
  if (digitalDevicesTonnes > 0.25) {
    opportunities.push({
      action: 'Eliminate Device Standby Phantom Draw & Stream at 1080p',
      potentialReductionTonnes: Number((digitalDevicesTonnes * 0.40).toFixed(2)),
      difficulty: 'Easy' as const,
      annualCostDelta: `Save ${curr}3,000 - ${curr}6,000/yr on phantom power draw`
    });
  }
  if (electricityTonnes > 1.2) {
    opportunities.push({
      action: 'Install Rooftop Solar PV or Green Tariff Subscription',
      potentialReductionTonnes: Number((electricityTonnes * 0.75).toFixed(2)),
      difficulty: 'Medium' as const,
      annualCostDelta: `Save ${curr}30,000 - ${curr}85,000/yr ($400 - $1,100/yr)`
    });
  }
  if (transportTotalTonnes > 1.5) {
    opportunities.push({
      action: 'Shift 2 Days/Week Commute to Metro / Transit / EV',
      potentialReductionTonnes: Number((transportTotalTonnes * 0.35).toFixed(2)),
      difficulty: 'Easy' as const,
      annualCostDelta: `Save ${curr}25,000 - ${curr}50,000/yr in motor fuel`
    });
  }

  const provenance: DataProvenance = createProvenanceRecord(
    'IPCC / GHG Protocol',
    'GHG-PROTOCOL-HYPERLOCAL-2024',
    input.subRegion ? input.subRegion.replace(/_/g, ' ') : (activeCountry?.name || input.gridRegion.replace(/_/g, ' ')),
    'Annual Greenhouse Gas Emissions (Disaggregated Scope 1, 2, 3, Plastics & Appliances)',
    'Activity & Telemetry Audit',
    'Tonnes CO2 equivalent (t CO2e)',
    'IPCC AR6 Guidelines, CEA Baseline Database v19, UNFCCC NDC Submissions, and UK DEFRA 2023 Factors',
    'CALCULATED_DERIVATION',
    input.exactCoordinates ? { latitude: input.exactCoordinates.latitude, longitude: input.exactCoordinates.longitude } : undefined,
    'https://unfccc.int/NDCREG',
    `Hyper-local calculation utilizing regional grid factor (${gridFactor.toFixed(3)} kg/kWh) and national NDC baselines`
  );

  return {
    totalCarbonTonnes,
    categoryBreakdown: {
      transport: Number(transportTotalTonnes.toFixed(2)),
      electricity: Number(electricityTonnes.toFixed(2)),
      householdEnergy: Number(householdEnergyTonnes.toFixed(2)),
      food: Number(foodTonnes.toFixed(2)),
      shopping: Number(shoppingTonnes.toFixed(2)),
      waste: Number(wasteTonnes.toFixed(2)),
      water: Number(waterTonnes.toFixed(2)),
      digitalDevices: Number(digitalDevicesTonnes.toFixed(2)),
      scope1Direct: Number(scope1Direct.toFixed(2)),
      scope2Indirect: Number(scope2Indirect.toFixed(2)),
      scope3SupplyChain: Number(scope3SupplyChain.toFixed(2))
    },
    largestContributor,
    benchmarkComparison: {
      userTonnes: totalCarbonTonnes,
      countryBenchmark: nationalBenchmarkVal,
      localDistrictBenchmark: localBenchmarkVal,
      globalAverage: NATIONAL_BENCHMARKS.Global_Average,
      parisTarget2030: NATIONAL_BENCHMARKS.ParisTarget2030,
      percentDiffVsBenchmark
    },
    reductionOpportunities: opportunities,
    granularAuditDetails: {
      applianceElectricity: applianceDetails,
      cookingFuelSuitability: cookingDetails,
      shoppingPlastics: plasticDetails
    },
    provenance
  };
}
