// ==========================================
// ECOGENESIS: DATA PROVENANCE & CORE TYPES
// ==========================================

export type DataSourceProvider = 
  | 'Open-Meteo'
  | 'NASA POWER'
  | 'CPCB India / data.gov.in'
  | 'GBIF'
  | 'Copernicus Climate Service'
  | 'OpenAQ'
  | 'Global Forest Watch'
  | 'NWIC National Water Data Portal India'
  | 'IPCC / GHG Protocol'
  | 'Calculated / Model Output';

export type DataQualityStatus = 'VERIFIED_LIVE' | 'VERIFIED_ARCHIVE' | 'MODEL_ESTIMATE' | 'CALCULATED_DERIVATION' | 'DEMO_BENCHMARK';

export interface DataProvenance {
  provider: DataSourceProvider;
  datasetId: string;
  locationName: string;
  coordinates?: { latitude: number; longitude: number };
  observationTimestamp: string;
  retrievalTimestamp: string;
  measurementParameter: string;
  rawUnit: string;
  normalizedUnit: string;
  rawScaleFactor?: number;
  methodology: string;
  qualityStatus: DataQualityStatus;
  sourceUrl: string;
  license: string;
  confidenceScore: number; // 0 - 100%
  notes?: string;
}

export type PersonaType = 
  | 'individual' 
  | 'household' 
  | 'school' 
  | 'business' 
  | 'ngo' 
  | 'community_admin';

export interface EnvironmentalMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change24h?: number;
  status: 'good' | 'moderate' | 'unhealthy' | 'hazardous' | 'optimal';
  provenance: DataProvenance;
}

export interface AirQualityData {
  aqiUs: number;
  pm25: number; // µg/m³
  pm10: number; // µg/m³
  no2: number;  // µg/m³
  so2: number;  // µg/m³
  o3: number;   // µg/m³
  co: number;   // µg/m³
  category: 'Good' | 'Moderate' | 'Unhealthy for Sensitive' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  provenance: DataProvenance;
}

export interface SolarIrradianceData {
  ghi: number; // Global Horizontal Irradiance (kWh/m²/day)
  dni: number; // Direct Normal Irradiance
  temp2m: number; // Celsius
  provenance: DataProvenance;
}

export interface GlobalClimateIndicators {
  atmosphericCO2: { value: number; unit: string; date: string; provenance: DataProvenance };
  globalTempAnomaly: { value: number; unit: string; baseline: string; provenance: DataProvenance };
  forestLossRate: { value: number; unit: string; year: string; provenance: DataProvenance };
  oceanHeatContent: { value: number; unit: string; baseline: string; provenance: DataProvenance };
}

// AI Assistant types
export interface AiAssistantResponse {
  query: string;
  problemAnalysis: string;
  recommendations: Array<{
    title: string;
    description: string;
    actionSteps: string[];
  }>;
  environmentalSavings: {
    carbonKgPerYear?: number;
    waterLitresPerYear?: number;
    energyKwhPerYear?: number;
    wasteKgPerYear?: number;
  };
  implementationDifficulty: 'Low' | 'Medium' | 'High';
  financialImplications: {
    initialInvestment: string;
    annualSavings: string;
    paybackPeriodYears?: number;
  };
  sourcesAndConfidence: {
    sources: string[];
    confidenceLevel: 'High' | 'Medium' | 'Preliminary';
    methodologyNote: string;
  };
}

// Carbon Footprint types
export interface FootprintInput {
  // Transport
  carKmPerWeek: number;
  carFuelType: 'petrol' | 'diesel' | 'hybrid' | 'ev';
  publicTransitKmPerWeek: number;
  flightsShortHaulPerYear: number;
  flightsLongHaulPerYear: number;
  // Energy
  electricityKwhPerMonth: number;
  cookingGasCylindersOrKgPerMonth: number;
  gridRegion: 'India_National' | 'US_Average' | 'EU_Average' | 'Global_Average';
  // Diet
  dietType: 'heavy_meat' | 'medium_meat' | 'pescatarian' | 'vegetarian' | 'vegan';
  localFoodPercentage: number;
  // Waste & Consumption
  wasteBagsPerWeek: number;
  recyclingRate: number; // 0 - 100%
  shoppingExpenditureLevel: 'minimal' | 'moderate' | 'high';
  // Water
  waterLitresPerDay: number;
  // Audit Mode: Lifestyle vs Enterprise
  auditMode?: 'personal' | 'enterprise_scopes';
  // Country & Spatial Knowledge Context
  countryCode?: 'IN' | 'US' | 'EU' | 'UK' | 'JP' | 'BR' | 'AU';
  exactCoordinates?: { latitude: number; longitude: number; accuracyMeters?: number };
  subRegion?: string;
  localPerCapitaBenchmark?: number;
  // Granular Appliance Electricity Disaggregation
  applianceElectricity?: {
    airConditioning: { count: number; tons: 1.0 | 1.5 | 2.0; hoursPerDaySummer: number; monthsPerYear: number; starRating: 1 | 2 | 3 | 4 | 5 };
    waterGeyser: { type: 'electric_storage' | 'instant_electric' | 'solar_thermal'; minutesPerDay: number };
    refrigerator: { type: 'single_door_5star' | 'double_door_frost_free' | 'older_inefficient' };
    fansAndLighting: { ceilingFanType: 'standard_induction_75w' | 'bldc_energy_saver_28w'; ledLightingRatioPercent: number };
  };
  // Cooking Fuel Suitability (LPG Cylinders vs PNG vs Induction)
  cookingFuelSuitability?: {
    fuelMode: 'lpg_14kg_cylinder' | 'png_piped_gas' | 'electric_induction' | 'lpg_19kg_commercial';
    lpgCylinderDaysDuration?: number; // e.g. 1 cylinder lasts 40 days
    pngScmPerMonth?: number; // Standard Cubic Meters
  };
  // Granular Shopping, Fashion & Plastics Decomposition
  shoppingPlasticsGranular?: {
    frequency: 'weekly' | 'biweekly' | 'monthly' | 'minimalist';
    fastFashionGarmentsPerYear: number;
    electronicsGadgetsPerYear: number;
    // Plastic polymer types
    petBottlesWeekly: number; // Code #1 PET
    hdpeBottlesMonthly: number; // Code #2 HDPE (detergents/milk)
    ldpeBagsWeekly: number; // Code #4 LDPE (thin grocery carry bags)
    ppTakeawayContainersWeekly: number; // Code #5 PP
    mlpSnackPacketsWeekly: number; // Code #7 Multi-Layer Plastics (chips/biscuits non-recyclable)
  };
  // Digital Device & Cloud Telemetry
  deviceUsage?: {
    smartphoneHoursPerDay: number;
    laptopPcHoursPerDay: number;
    tvStreamingHoursPerDay: number;
    dailyDataStreamingGb: number;
    standbyDevicesCount: number;
  };
  // Business Specific (Scope 1, 2, 3)
  scope1DirectFuelLitres?: number;
  scope2FacilityKwh?: number;
  scope3SupplyChainTonnes?: number;
  employeeCount?: number;
}

export interface ApplianceAuditDetails {
  acKwhPerMonth: number;
  geyserKwhPerMonth: number;
  refrigeratorKwhPerMonth: number;
  fansAndLightingKwhPerMonth: number;
  totalDisaggregatedKwhPerMonth: number;
  acAnnualTonnesCO2: number;
}

export interface CookingAuditDetails {
  fuelMode: string;
  annualLpgCylinders?: number;
  cookingCarbonTonnes: number;
  inductionAnnualKwhNeeded: number;
  inductionAnnualCarbonTonnes: number;
  transitionSavingsTonnes: number;
  costSavingsComparison: string;
}

export interface ShoppingPlasticsAuditDetails {
  totalPlasticKgPerYear: number;
  petBottlesKg: number;
  hdpeContainersKg: number;
  ldpeBagsKg: number;
  ppContainersKg: number;
  mlpPacketsKg: number;
  plasticCarbonTonnes: number;
  fastFashionTonnes: number;
  recyclableSharePercent: number;
}

export interface FootprintResult {
  totalCarbonTonnes: number;
  categoryBreakdown: {
    transport: number;
    electricity: number;
    householdEnergy: number;
    food: number;
    shopping: number;
    waste: number;
    water: number;
    digitalDevices?: number;
    scope1Direct?: number;
    scope2Indirect?: number;
    scope3SupplyChain?: number;
  };
  largestContributor: string;
  benchmarkComparison: {
    userTonnes: number;
    countryBenchmark: number;
    localDistrictBenchmark?: number;
    globalAverage: number;
    parisTarget2030: number;
    percentDiffVsBenchmark: number;
  };
  reductionOpportunities: Array<{
    action: string;
    potentialReductionTonnes: number;
    difficulty: 'Easy' | 'Medium' | 'Challenging';
    annualCostDelta: string;
  }>;
  granularAuditDetails?: {
    applianceElectricity?: ApplianceAuditDetails;
    cookingFuelSuitability?: CookingAuditDetails;
    shoppingPlastics?: ShoppingPlasticsAuditDetails;
  };
  provenance: DataProvenance;
}

// Planner Types
export interface SustainabilityGoal {
  id: string;
  title: string;
  category: 'energy' | 'water' | 'waste' | 'mobility' | 'nature' | 'food';
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  completed: boolean;
}

export interface SustainabilityChallenge {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  participantsCount: number;
  category: 'energy' | 'water' | 'waste' | 'mobility' | 'nature' | 'food';
  impactDescription: string;
  active: boolean;
}

export interface ActivityLog {
  id: string;
  date: string;
  category: string;
  description: string;
  verifiedImpact: {
    carbonSavedKg: number;
    waterSavedLitres: number;
  };
}

// Waste Management Types
export interface WasteItem {
  id: string;
  name: string;
  category: 'Recyclable' | 'Compostable / Organic' | 'E-Waste' | 'Hazardous' | 'Landfill / Non-Recyclable';
  preparationInstructions: string[];
  recyclingRules: string;
  commonContaminants: string[];
  biodegradationTime: string;
  ecoAlternative: string;
}

export interface WasteLogEntry {
  id: string;
  date: string;
  itemCategory: string;
  weightKg: number;
  disposalMethod: 'recycled' | 'composted' | 'landfill';
}

// Water Conservation Types
export interface WaterAuditInput {
  householdMembers: number;
  showerMinutesPerDay: number;
  showerFlowRateLpm: number; // Litres per min (e.g. 9 or 15)
  flushesPerPersonPerDay: number;
  toiletType: 'dual_flush_low' | 'standard_single';
  laundryLoadsPerWeek: number;
  washingMachineEfficiency: 'standard' | 'water_efficient';
  gardenWateringMinutesPerWeek: number;
  carWashingTimesPerMonth: number;
}

export interface RainwaterHarvestingInput {
  roofAreaSqMeters: number;
  annualRainfallMm: number;
  roofType: 'concrete_tile' | 'metal_sheet' | 'corrugated_asbestos' | 'tar_gravel';
  filterEfficiency: number; // e.g. 0.85
}

// Renewable Energy Simulator Types
export interface SolarSimulatorInput {
  roofAreaSqMeters: number;
  solarIrradianceKwhM2Day: number;
  panelEfficiencyPercent: number; // e.g. 21%
  systemLossFactor: number; // e.g. 0.8 (20% inverter, wiring, dust derate)
  costPerWattInstalled: number; // e.g. $1.00 or ₹55
  gridTariffPerKwh: number; // e.g. $0.15 or ₹8.0
}

// Biodiversity Types
export interface GbifSpeciesOccurrence {
  key: number;
  scientificName: string;
  vernacularName?: string;
  kingdom: string;
  family?: string;
  decimalLatitude: number;
  decimalLongitude: number;
  eventDate?: string;
  basisOfRecord: string;
  datasetName?: string;
  mediaUrl?: string;
}

export interface CitizenScienceObservation {
  id: string;
  speciesName: string;
  category: 'Flora' | 'Fauna' | 'Fungi' | 'Pollinator';
  latitude: number;
  longitude: number;
  locationObfuscated: boolean;
  notes: string;
  timestamp: string;
  verified: boolean;
  photoUrl?: string;
}

// Map Item Types
export interface MapProject {
  id: string;
  name: string;
  category: 'reforestation' | 'renewable' | 'cleanup' | 'water_restoration' | 'air_station' | 'biodiversity_sanctuary';
  latitude: number;
  longitude: number;
  description: string;
  status: 'active' | 'in_progress' | 'operational';
  impactMetric: string;
  verifiedOrganization: string;
  sourceUrl: string;
}

// Community Types
export interface CommunityInitiative {
  id: string;
  title: string;
  organization: string;
  category: string;
  participants: number;
  targetParticipants: number;
  verifiedImpact: string;
  status: 'Open' | 'In Progress' | 'Completed';
  location: string;
  startDate: string;
}
