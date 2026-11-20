/**
 * ECOGENESIS emission factors and benchmarks.
 *
 * INTEGRITY RULES
 * - Every factor carries a source string and a confidence tag:
 *   "published" (from a named public dataset), "derived" (simple arithmetic
 *   on published values), or "assumption" (documented, illustrative).
 * - All results produced with these factors are ESTIMATES, never measurements.
 * - Regional defaults favour India (CEA grid factor); users may override.
 */

export type Confidence = "published" | "derived" | "assumption";

export interface Factor {
  key: string;
  value: number;
  unit: string;
  source: string;
  confidence: Confidence;
}

export const FACTORS: Record<string, Factor> = {
  // --- Transport (per passenger-km, tailpipe/direct unless noted) ---
  car_petrol: { key: "car_petrol", value: 0.171, unit: "kgCO2e/km", source: "UK DEFRA 2023 GHG conversion factors — average petrol car", confidence: "published" },
  car_diesel: { key: "car_diesel", value: 0.168, unit: "kgCO2e/km", source: "UK DEFRA 2023 GHG conversion factors — average diesel car", confidence: "published" },
  car_ev_grid: { key: "car_ev_grid", value: 0.19, unit: "kWh/km (consumption assumption)", source: "ASSUMPTION: EV consumption 0.19 kWh/km, charged with the regional grid factor the user selects", confidence: "assumption" },
  two_wheeler: { key: "two_wheeler", value: 0.103, unit: "kgCO2e/km", source: "UK DEFRA 2023 — average motorbike (petrol)", confidence: "published" },
  bus: { key: "bus", value: 0.102, unit: "kgCO2e/pkm", source: "UK DEFRA 2023 — local bus, average", confidence: "published" },
  train: { key: "train", value: 0.035, unit: "kgCO2e/pkm", source: "UK DEFRA 2023 — national rail, average", confidence: "published" },
  flight_shorthaul: { key: "flight_shorthaul", value: 0.157, unit: "kgCO2e/pkm", source: "UK DEFRA 2023 — short-haul international flight, economy", confidence: "published" },
  flight_longhaul: { key: "flight_longhaul", value: 0.147, unit: "kgCO2e/pkm", source: "UK DEFRA 2023 — long-haul international flight, economy", confidence: "published" },
  flight_trip_short_km: { key: "flight_trip_short_km", value: 2200, unit: "km/round-trip (assumed distance)", source: "ASSUMPTION: a short-haul round trip ≈ 2,200 km", confidence: "assumption" },
  flight_trip_long_km: { key: "flight_trip_long_km", value: 14000, unit: "km/round-trip (assumed distance)", source: "ASSUMPTION: a long-haul round trip ≈ 14,000 km", confidence: "assumption" },

  // --- Home energy ---
  grid_india: { key: "grid_india", value: 0.713, unit: "kgCO2/kWh", source: "CEA (Central Electricity Authority, India) CO2 Baseline Database v21.0 — 2023-24 weighted grid emission factor (CO2 only)", confidence: "published" },
  grid_world: { key: "grid_world", value: 0.481, unit: "kgCO2e/kWh", source: "IEA World Energy Outlook 2023 average global electricity carbon intensity (approx.)", confidence: "derived" },
  lpg: { key: "lpg", value: 2.9185, unit: "kgCO2e/kg", source: "UK DEFRA 2023 — LPG combustion factor (net CV)", confidence: "published" },
  lpg_cylinder_kg: { key: "lpg_cylinder_kg", value: 14.2, unit: "kg/cylinder", source: "Standard Indian domestic LPG cylinder net capacity", confidence: "published" },
  natural_gas: { key: "natural_gas", value: 0.203, unit: "kgCO2e/kWh (gross CV)", source: "UK DEFRA 2023 — natural gas, gross CV", confidence: "published" },

  // --- Food (annual food-related footprint per average adult, 2000 kcal/day) ---
  diet_heavy_meat: { key: "diet_heavy_meat", value: 7.2, unit: "tCO2e/year", source: "Scarborough et al. 2014 (Climatic Change) — high-meat-eater diet GHG estimate, UK", confidence: "published" },
  diet_medium_meat: { key: "diet_medium_meat", value: 5.6, unit: "tCO2e/year", source: "Scarborough et al. 2014 — medium-meat-eater diet GHG estimate, UK", confidence: "published" },
  diet_low_meat: { key: "diet_low_meat", value: 4.7, unit: "tCO2e/year", source: "Scarborough et al. 2014 — low-meat-eater diet GHG estimate, UK", confidence: "published" },
  diet_vegetarian: { key: "diet_vegetarian", value: 3.8, unit: "tCO2e/year", source: "Scarborough et al. 2014 — vegetarian diet GHG estimate, UK", confidence: "published" },
  diet_vegan: { key: "diet_vegan", value: 2.9, unit: "tCO2e/year", source: "Scarborough et al. 2014 — vegan diet GHG estimate, UK", confidence: "published" },
  food_waste_multiplier_moderate: { key: "food_waste_multiplier_moderate", value: 1.05, unit: "×", source: "ASSUMPTION: moderate household food waste adds ~5% to the diet footprint", confidence: "assumption" },
  food_waste_multiplier_high: { key: "food_waste_multiplier_high", value: 1.15, unit: "×", source: "ASSUMPTION: high household food waste adds ~15% to the diet footprint", confidence: "assumption" },

  // --- Goods & services (illustrative product lifecycle footprints) ---
  clothing_item: { key: "clothing_item", value: 15, unit: "kgCO2e/item", source: "ASSUMPTION: mid-range of published garment LCAs (≈7-25 kgCO2e per item)", confidence: "assumption" },
  smartphone: { key: "smartphone", value: 70, unit: "kgCO2e/device", source: "Manufacturer-published product LCA midpoints (e.g. Apple iPhone ~60-80 kgCO2e)", confidence: "derived" },
  laptop: { key: "laptop", value: 320, unit: "kgCO2e/device", source: "Manufacturer-published product LCA midpoints (e.g. Apple MacBook ~250-400 kgCO2e)", confidence: "derived" },

  // --- Waste (per kg handled) ---
  waste_landfill: { key: "waste_landfill", value: 0.468, unit: "kgCO2e/kg", source: "UK DEFRA 2023 — landfill disposal of mixed waste (≈467.85 kgCO2e/tonne)", confidence: "published" },
  waste_recycled: { key: "waste_recycled", value: 0.021, unit: "kgCO2e/kg", source: "UK DEFRA 2023 — recycling (open-loop, ≈20.7 kgCO2e/tonne)", confidence: "published" },
  waste_composted: { key: "waste_composted", value: 0.009, unit: "kgCO2e/kg", source: "UK DEFRA 2023 — composting (≈8.9 kgCO2e/tonne)", confidence: "published" },

  // --- Water supply + treatment ---
  water_supply_treatment: { key: "water_supply_treatment", value: 0.421, unit: "kgCO2e/m3", source: "UK DEFRA 2023 — water supply (0.149) + water treatment (0.272) kgCO2e/m3", confidence: "published" },
};

/** Benchmarks clearly labelled as fossil-CO2 per-capita averages. */
export const BENCHMARKS = {
  india: {
    value: 2.0,
    unit: "tCO2/person/year (fossil CO2)",
    source: "Global Carbon Budget 2023 — India fossil-CO2 per-capita average",
  },
  world: {
    value: 4.7,
    unit: "tCO2/person/year (fossil CO2)",
    source: "Global Carbon Budget 2023 — world fossil-CO2 per-capita average",
  },
};

export const METHODOLOGY_NOTE =
  "This calculator multiplies stated activities by documented emission factors. Results are ESTIMATES, not audited measurements. " +
  "Transport, diet and purchased-goods inputs are treated as the individual user's activities. Household electricity, LPG/PNG, waste and water inputs are treated as whole-household totals and divided by household size. " +
  "DEFRA factors are UK averages used as defaults; the India electricity factor is a published CEA value. Actual emissions vary by region, provider, vehicle and consumption pattern. " +
  "The India and world reference benchmarks cover fossil CO2 only and are NOT directly comparable with this broader CO2e estimate.";

export interface FootprintInputs {
  // transport
  carType: "petrol" | "diesel" | "ev" | "none";
  carKmWeek: number;
  twoWheelerKmWeek: number;
  busKmWeek: number;
  trainKmWeek: number;
  shortFlightsYear: number;
  longFlightsYear: number;
  // home energy
  electricityKwhMonth: number;
  grid: "india" | "world" | "custom";
  customGridFactor: number;
  lpgCylindersMonth: number;
  pngKwhMonth: number;
  // food
  diet: "heavy_meat" | "medium_meat" | "low_meat" | "vegetarian" | "vegan";
  foodWaste: "low" | "moderate" | "high";
  // goods
  clothingItemsYear: number;
  phonesYear: number;
  laptopsYear: number;
  // waste
  landfillKgWeek: number;
  recycledKgWeek: number;
  compostedKgWeek: number;
  // water
  waterLitresDay: number;
  // meta
  householdSize: number;
}

export interface CategoryResult {
  key: string;
  label: string;
  kgCo2e: number;
  detail: string[];
}

export interface FootprintResult {
  /** Per-person annual estimate after allocating shared household inputs. */
  totalKg: number;
  perPersonKg: number;
  householdSize: number;
  allocationNote: string;
  categories: CategoryResult[];
  factorsUsed: Factor[];
  benchmarks: typeof BENCHMARKS;
  methodology: string;
}

function clampPos(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function calculateFootprint(raw: Partial<FootprintInputs>, historicalFactors: Factor[] = []): FootprintResult {
  const inputs: FootprintInputs = {
    carType: (["petrol", "diesel", "ev", "none"].includes(String(raw.carType)) ? raw.carType : "none") as FootprintInputs["carType"],
    carKmWeek: clampPos(raw.carKmWeek ?? 0),
    twoWheelerKmWeek: clampPos(raw.twoWheelerKmWeek ?? 0),
    busKmWeek: clampPos(raw.busKmWeek ?? 0),
    trainKmWeek: clampPos(raw.trainKmWeek ?? 0),
    shortFlightsYear: clampPos(raw.shortFlightsYear ?? 0),
    longFlightsYear: clampPos(raw.longFlightsYear ?? 0),
    electricityKwhMonth: clampPos(raw.electricityKwhMonth ?? 0),
    grid: (["india", "world", "custom"].includes(String(raw.grid)) ? raw.grid : "india") as FootprintInputs["grid"],
    customGridFactor: Math.min(2, clampPos(raw.customGridFactor ?? 0.713)),
    lpgCylindersMonth: clampPos(raw.lpgCylindersMonth ?? 0),
    pngKwhMonth: clampPos(raw.pngKwhMonth ?? 0),
    diet: (["heavy_meat", "medium_meat", "low_meat", "vegetarian", "vegan"].includes(String(raw.diet)) ? raw.diet : "medium_meat") as FootprintInputs["diet"],
    foodWaste: (["low", "moderate", "high"].includes(String(raw.foodWaste)) ? raw.foodWaste : "moderate") as FootprintInputs["foodWaste"],
    clothingItemsYear: clampPos(raw.clothingItemsYear ?? 0),
    phonesYear: clampPos(raw.phonesYear ?? 0),
    laptopsYear: clampPos(raw.laptopsYear ?? 0),
    landfillKgWeek: clampPos(raw.landfillKgWeek ?? 0),
    recycledKgWeek: clampPos(raw.recycledKgWeek ?? 0),
    compostedKgWeek: clampPos(raw.compostedKgWeek ?? 0),
    waterLitresDay: clampPos(raw.waterLitresDay ?? 0),
    householdSize: Math.min(12, Math.max(1, Math.floor(clampPos(raw.householdSize ?? 1)))),
  };

  const factorsUsed: Factor[] = [];
  const historicalFactorMap = new Map<string, Factor>();
  for (const candidate of historicalFactors) {
    if (
      candidate && typeof candidate.key === "string" &&
      Number.isFinite(candidate.value) && candidate.value >= 0 &&
      typeof candidate.unit === "string" && typeof candidate.source === "string" &&
      ["published", "derived", "assumption"].includes(candidate.confidence)
    ) {
      historicalFactorMap.set(candidate.key, candidate);
    }
  }
  const used = (k: string): Factor => {
    const f = historicalFactorMap.get(k) ?? FACTORS[k];
    if (f && !factorsUsed.some((item) => item.key === f.key)) factorsUsed.push(f);
    return f;
  };
  let customGridSnapshot: Factor | null = historicalFactorMap.get("grid_custom") ?? null;
  const getGridFactor = (): Factor => {
    if (inputs.grid === "world") return used("grid_world");
    if (inputs.grid === "custom") {
      if (!customGridSnapshot) {
        customGridSnapshot = {
          key: "grid_custom",
          value: inputs.customGridFactor,
          unit: "kgCO2e/kWh",
          source: "User-supplied electricity grid emission factor; not independently verified by ECOGENESIS",
          confidence: "assumption",
        };
      }
      if (!factorsUsed.some((item) => item.key === "grid_custom")) factorsUsed.push(customGridSnapshot);
      return customGridSnapshot;
    }
    return used("grid_india");
  };

  // Transport
  let transport = 0;
  const tDetail: string[] = [];
  if (inputs.carType === "petrol" || inputs.carType === "diesel") {
    const f = used(inputs.carType === "petrol" ? "car_petrol" : "car_diesel");
    const kg = f.value * inputs.carKmWeek * 52;
    transport += kg;
    tDetail.push(`Car (${inputs.carType}): ${inputs.carKmWeek} km/week × ${f.value} kgCO2e/km × 52 = ${kg.toFixed(0)} kg`);
  } else if (inputs.carType === "ev") {
    const f = used("car_ev_grid");
    const gridFactor = getGridFactor();
    const kg = f.value * gridFactor.value * inputs.carKmWeek * 52;
    transport += kg;
    tDetail.push(`EV: ${inputs.carKmWeek} km/week × ${f.value} kWh/km × ${gridFactor.value} kgCO2e/kWh grid × 52 = ${kg.toFixed(0)} kg`);
  }
  const tw = used("two_wheeler").value * inputs.twoWheelerKmWeek * 52;
  transport += tw;
  if (inputs.twoWheelerKmWeek) tDetail.push(`Two-wheeler: ${kgFmt(tw)}`);
  const bus = used("bus").value * inputs.busKmWeek * 52;
  transport += bus;
  if (inputs.busKmWeek) tDetail.push(`Bus: ${kgFmt(bus)}`);
  const train = used("train").value * inputs.trainKmWeek * 52;
  transport += train;
  if (inputs.trainKmWeek) tDetail.push(`Train/metro: ${kgFmt(train)}`);
  const shortDistance = inputs.shortFlightsYear ? used("flight_trip_short_km").value : FACTORS.flight_trip_short_km.value;
  const flightsShort = used("flight_shorthaul").value * shortDistance * inputs.shortFlightsYear;
  transport += flightsShort;
  if (inputs.shortFlightsYear) tDetail.push(`Short-haul flights: ${inputs.shortFlightsYear} round-trips × ${shortDistance.toLocaleString()} km × published factor = ${kgFmt(flightsShort)}`);
  const longDistance = inputs.longFlightsYear ? used("flight_trip_long_km").value : FACTORS.flight_trip_long_km.value;
  const flightsLong = used("flight_longhaul").value * longDistance * inputs.longFlightsYear;
  transport += flightsLong;
  if (inputs.longFlightsYear) tDetail.push(`Long-haul flights: ${inputs.longFlightsYear} round-trips × ${longDistance.toLocaleString()} km × published factor = ${kgFmt(flightsLong)}`);

  // Home energy
  let energy = 0;
  const eDetail: string[] = [];
  const gridFactor = getGridFactor();
  const elec = gridFactor.value * inputs.electricityKwhMonth * 12;
  energy += elec;
  eDetail.push(`Household electricity: ${inputs.electricityKwhMonth} kWh/month × ${gridFactor.value} kgCO2e/kWh × 12 = ${kgFmt(elec)} kg before household allocation`);
  const lpgCylinder = used("lpg_cylinder_kg");
  const lpg = used("lpg").value * lpgCylinder.value * inputs.lpgCylindersMonth * 12;
  energy += lpg;
  if (inputs.lpgCylindersMonth) eDetail.push(`Household LPG: ${inputs.lpgCylindersMonth} cylinders/month × ${lpgCylinder.value} kg × 2.9185 kgCO2e/kg = ${kgFmt(lpg)} kg before household allocation`);
  const png = used("natural_gas").value * inputs.pngKwhMonth * 12;
  energy += png;
  if (inputs.pngKwhMonth) eDetail.push(`Household piped gas: ${inputs.pngKwhMonth} kWh/month × 0.203 × 12 = ${kgFmt(png)} kg before household allocation`);

  // Food
  const dietKey = `diet_${inputs.diet}` as keyof typeof FACTORS;
  const dietF = used(dietKey);
  const wasteMult = inputs.foodWaste === "high" ? used("food_waste_multiplier_high").value : inputs.foodWaste === "moderate" ? used("food_waste_multiplier_moderate").value : 1;
  const food = dietF.value * 1000 * wasteMult;
  const fDetail = [
    `Individual diet archetype: ${dietF.value} tCO2e/year (Scarborough et al. 2014, UK study; applied as a non-India-specific estimate)`,
    ...(wasteMult > 1 ? [`Food-waste multiplier: × ${wasteMult} (documented assumption applied to this individual diet estimate)`] : []),
  ];

  // Goods
  let goods = 0;
  const gDetail: string[] = [];
  const cloth = used("clothing_item").value * inputs.clothingItemsYear;
  goods += cloth;
  if (inputs.clothingItemsYear) gDetail.push(`Individual clothing purchases: ${inputs.clothingItemsYear} items × 15 kgCO2e (assumption) = ${kgFmt(cloth)} kg`);
  const phones = used("smartphone").value * inputs.phonesYear;
  goods += phones;
  if (inputs.phonesYear) gDetail.push(`Individual smartphones: ${inputs.phonesYear} × 70 kgCO2e (manufacturer LCA midpoint) = ${kgFmt(phones)} kg`);
  const laptops = used("laptop").value * inputs.laptopsYear;
  goods += laptops;
  if (inputs.laptopsYear) gDetail.push(`Individual laptops: ${inputs.laptopsYear} × 320 kgCO2e (manufacturer LCA midpoint) = ${kgFmt(laptops)} kg`);

  // Waste
  let waste = 0;
  const wDetail: string[] = [];
  const lf = used("waste_landfill").value * inputs.landfillKgWeek * 52;
  waste += lf;
  if (inputs.landfillKgWeek) wDetail.push(`Household landfilled waste: ${inputs.landfillKgWeek} kg/week × 0.468 = ${kgFmt(lf)} kg before household allocation`);
  const rc = used("waste_recycled").value * inputs.recycledKgWeek * 52;
  waste += rc;
  if (inputs.recycledKgWeek) wDetail.push(`Household recycled waste: ${inputs.recycledKgWeek} kg/week × 0.021 = ${kgFmt(rc)} kg before household allocation`);
  const cp = used("waste_composted").value * inputs.compostedKgWeek * 52;
  waste += cp;
  if (inputs.compostedKgWeek) wDetail.push(`Household composted waste: ${inputs.compostedKgWeek} kg/week × 0.009 = ${kgFmt(cp)} kg before household allocation`);

  // Water
  const water = used("water_supply_treatment").value * (inputs.waterLitresDay * 365) / 1000;
  const aDetail = [`Household water: ${inputs.waterLitresDay} L/day × 365 × 0.421 kgCO2e/m³ = ${kgFmt(water)} kg before household allocation`];

  // Shared household inputs are allocated once across occupants. Personal
  // transport, diet and goods inputs are not divided by household size.
  const sharedDivisor = inputs.householdSize;
  const categories: CategoryResult[] = [
    { key: "transport", label: "Personal Transport", kgCo2e: transport, detail: tDetail },
    { key: "energy", label: "Allocated Home Energy", kgCo2e: energy / sharedDivisor, detail: [...eDetail, `Allocated to one person: household energy ${kgFmt(energy)} kg ÷ ${sharedDivisor} occupants = ${kgFmt(energy / sharedDivisor)} kg`] },
    { key: "food", label: "Personal Food", kgCo2e: food, detail: fDetail },
    { key: "goods", label: "Personal Goods & Shopping", kgCo2e: goods, detail: gDetail },
    { key: "waste", label: "Allocated Household Waste", kgCo2e: waste / sharedDivisor, detail: [...wDetail, `Allocated to one person: household waste ${kgFmt(waste)} kg ÷ ${sharedDivisor} occupants = ${kgFmt(waste / sharedDivisor)} kg`] },
    { key: "water", label: "Allocated Household Water", kgCo2e: water / sharedDivisor, detail: [...aDetail, `Allocated to one person: household water ${kgFmt(water)} kg ÷ ${sharedDivisor} occupants = ${kgFmt(water / sharedDivisor)} kg`] },
  ];

  // totalKg is intentionally the per-person allocated estimate. This preserves
  // the API's historical field name while eliminating a mixed household sum.
  const totalKg = categories.reduce((sum, category) => sum + category.kgCo2e, 0);
  const perPersonKg = totalKg;

  return {
    totalKg,
    perPersonKg,
    householdSize: inputs.householdSize,
    allocationNote: `Transport, food and goods represent the individual user's activities. Household energy, waste and water are divided equally across ${inputs.householdSize} occupants.`,
    categories,
    factorsUsed,
    benchmarks: BENCHMARKS,
    methodology: METHODOLOGY_NOTE,
  };
}

function kgFmt(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(2)} t` : `${n.toFixed(0)} kg`;
}

export interface ReductionIdea {
  title: string;
  category: string;
  description: string;
  estimatedSaving: string;
  difficulty: "low" | "medium" | "high";
  cost: string;
  basis: string;
}

export const REDUCTION_IDEAS: ReductionIdea[] = [
  {
    title: "Shift short car trips to public transport or cycling",
    category: "transport",
    description: "Trips under 5 km are ideal candidates for metro/bus, walking or cycling.",
    estimatedSaving: "Roughly 0.1-0.17 kgCO2e avoided per km shifted (per the published per-km factors above)",
    difficulty: "medium",
    cost: "Low — transit fares, cycle maintenance",
    basis: "Derived directly from the DEFRA per-km factors used by this calculator",
  },
  {
    title: "Set the air-conditioner to 24-26 degC and clean filters",
    category: "energy",
    description: "Each degree of cooling-setpoint increase typically cuts AC electricity use measurably; dirty filters raise consumption further.",
    estimatedSaving: "Illustrative range: 6-10% of cooling-related electricity per degC raised (manufacturer/utility guidance; varies by unit and climate)",
    difficulty: "low",
    cost: "None to minimal",
    basis: "Bureau of Energy Efficiency / utility guidance ranges; treat as indicative, not guaranteed",
  },
  {
    title: "Replace remaining filament/halogen bulbs with LED",
    category: "energy",
    description: "LEDs use about 75-85% less electricity than incandescent bulbs for the same light output.",
    estimatedSaving: "Illustrative: ~0.05 kWh per bulb-hour saved × your grid factor",
    difficulty: "low",
    cost: "Low upfront, payback within months",
    basis: "US DOE / BEE efficiency guidance ranges",
  },
  {
    title: "Run appliances off-peak and full loads only",
    category: "energy",
    description: "Washing machines and dishwashers are most efficient when full; off-peak running supports a cleaner grid mix.",
    estimatedSaving: "Grid-dependent; savings depend on your utility's peak generation mix",
    difficulty: "low",
    cost: "None",
    basis: "General efficiency guidance — the CO2 effect depends on your grid, so treat as directional",
  },
  {
    title: "Cut household food waste with meal planning",
    category: "food",
    description: "Plan purchases, store food correctly, and compost what remains.",
    estimatedSaving: "Up to the food-waste multiplier share of your diet footprint (5-15% in this calculator's assumptions)",
    difficulty: "medium",
    cost: "None — usually saves money on groceries",
    basis: "UN FAO food-waste reporting; multiplier documented in this calculator",
  },
  {
    title: "Shift one or more meat-heavy meals per week to plant-based",
    category: "food",
    description: "Moving between diet archetypes moves your estimate between the published study values used here.",
    estimatedSaving: "≈0.9-1.8 tCO2e/year between adjacent diet archetypes (per Scarborough et al. 2014 values used above)",
    difficulty: "medium",
    cost: "Usually saves money",
    basis: "Published dietary-GHG study values built into this calculator",
  },
  {
    title: "Separate and compost organic waste",
    category: "waste",
    description: "Organic matter landfilled without oxygen produces methane; composting avoids most of that.",
    estimatedSaving: "≈0.46 kgCO2e avoided per kg composted instead of landfilled (the two waste factors used above)",
    difficulty: "low",
    cost: "None to low (home compost bin)",
    basis: "DEFRA landfill vs composting factors built into this calculator",
  },
  {
    title: "Fix leaky taps and install aerators",
    category: "water",
    description: "A leaking tap can waste thousands of litres a year; tap aerators cut flow without hurting usability.",
    estimatedSaving: "Illustrative: a 1 L/min leak wastes ~525 m3/year ≈ 220 kgCO2e/year at the water factor used above",
    difficulty: "low",
    cost: "Very low",
    basis: "Flow-rate arithmetic using the DEFRA water supply+treatment factor built into this calculator",
  },
  {
    title: "Choose repair and second-hand before replacing devices",
    category: "goods",
    description: "Most of a phone's or laptop's footprint is in manufacturing, not use.",
    estimatedSaving: "≈70 kgCO2e per avoided smartphone, ≈320 kg per avoided laptop (the product LCA midpoints used above)",
    difficulty: "low",
    cost: "Usually saves money",
    basis: "Manufacturer-published LCA midpoints built into this calculator",
  },
];

export const FACTOR_SOURCES_SUMMARY = [
  "UK DEFRA 2023 Greenhouse Gas Conversion Factors (transport fuels, LPG, natural gas, waste treatment, water)",
  "CEA India CO2 Baseline Database v21.0 (grid electricity, 2023-24)",
  "Scarborough et al. 2014, Climatic Change — dietary GHG estimates",
  "Global Carbon Budget 2023 — per-capita fossil-CO2 benchmarks",
  "Manufacturer product LCAs (illustrative midpoints for phones/laptops)",
  "BEE / US DOE efficiency guidance (illustrative savings ranges)",
];
