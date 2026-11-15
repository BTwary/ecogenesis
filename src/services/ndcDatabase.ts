export interface CountryNDC {
  code: 'IN' | 'US' | 'EU' | 'UK' | 'JP' | 'BR' | 'AU';
  name: string;
  flagEmoji: string;
  currencySymbol: string;
  currencyCode: string;
  nationalGridCarbonIntensity: number; // kg CO2e / kWh
  nationalPerCapitaBaseline: number; // t CO2e / yr
  parisRatificationDate: string;
  targetYear2030: string;
  emissionsReductionTarget: string;
  baselineYear: string;
  netZeroTargetYear: number;
  renewableEnergyTarget: string;
  carbonSinkTarget: string;
  keyPolicyPillars: Array<{
    name: string;
    description: string;
    targetImpact: string;
  }>;
  climateActionTrackerRating: 'Critically Insufficient' | 'Highly Insufficient' | 'Insufficient' | 'Almost Sufficient' | '1.5°C Compatible';
  typicalCookingFuel: string;
  typicalHeatingCooling: string;
  subRegions: Array<{
    id: string;
    name: string;
    gridCarbonIntensity: number;
    perCapitaTonnes: number;
    description: string;
  }>;
}

export const NDC_DATABASE: Record<string, CountryNDC> = {
  IN: {
    code: 'IN',
    name: 'India',
    flagEmoji: '🇮🇳',
    currencySymbol: '₹',
    currencyCode: 'INR',
    nationalGridCarbonIntensity: 0.713, // CEA Baseline Database v19
    nationalPerCapitaBaseline: 1.9, // World Bank / IEA (below global avg 4.7t)
    parisRatificationDate: 'October 2, 2016',
    targetYear2030: '2030',
    emissionsReductionTarget: 'Reduce Emissions Intensity of GDP by 45% below 2005 levels by 2030',
    baselineYear: '2005',
    netZeroTargetYear: 2070,
    renewableEnergyTarget: '50% cumulative electric power installed capacity from non-fossil sources by 2030 (target: 500 GW non-fossil)',
    carbonSinkTarget: 'Create an additional carbon sink of 2.5 to 3.0 billion tonnes of CO2e through additional forest and tree cover by 2030',
    climateActionTrackerRating: 'Insufficient',
    typicalCookingFuel: '14.2 kg Subsidized Domestic LPG Cylinders (Pradhan Mantri Ujjwala Yojana) & Piped Natural Gas (PNG)',
    typicalHeatingCooling: 'Ceiling fans (standard 75W / BLDC 28W) & Split Inverter ACs (1.0 - 2.0 Ton, 3-star / 5-star)',
    keyPolicyPillars: [
      {
        name: 'Mission LiFE (Lifestyle for Environment)',
        description: 'Global mass movement mobilizing individuals for pro-planet consumer actions (energy conservation, plastic avoidance, water efficiency).',
        targetImpact: 'Targeting 1 billion individuals to adopt sustainable behaviors by 2028.'
      },
      {
        name: 'Perform, Achieve and Trade (PAT) & Carbon Credit Trading Scheme (CCTS)',
        description: 'Market-based mechanism mandated by BEE for energy-intensive industrial sectors (thermal power, cement, steel, fertilizers).',
        targetImpact: 'Over 24 million tonnes of oil equivalent (Mtoe) energy savings realized in Cycles I-VI.'
      },
      {
        name: 'PM-KUSUM & National Solar Mission',
        description: 'Decentralized agricultural solar feeder pumps and utility-scale solar parks to decouple rural irrigation from diesel/coal grids.',
        targetImpact: 'Over 130 GW renewable capacity installed, scaling toward 500 GW by 2030.'
      },
      {
        name: 'National Green Hydrogen Mission',
        description: 'Strategic production target of at least 5 Million Metric Tonnes (MMT) of green hydrogen per annum with 125 GW associated RE capacity.',
        targetImpact: 'Abatement of ~50 MMT of annual GHG emissions by 2030.'
      }
    ],
    subRegions: [
      { id: 'in-dl-delhi', name: 'Delhi NCR (National Capital)', gridCarbonIntensity: 0.713, perCapitaTonnes: 2.3, description: 'Northern Regional Load Dispatch Center (NRLDC)' },
      { id: 'in-mh-mumbai', name: 'Mumbai, Maharashtra', gridCarbonIntensity: 0.720, perCapitaTonnes: 2.1, description: 'Western Grid · Tata / Adani mixed distribution' },
      { id: 'in-ka-bengaluru', name: 'Bengaluru, Karnataka', gridCarbonIntensity: 0.650, perCapitaTonnes: 1.8, description: 'Southern Grid · High hydro & solar penetration' },
      { id: 'in-tn-chennai', name: 'Chennai, Tamil Nadu', gridCarbonIntensity: 0.680, perCapitaTonnes: 1.9, description: 'Southern Grid · Major wind & nuclear corridor' },
      { id: 'in-wb-kolkata', name: 'Kolkata, West Bengal', gridCarbonIntensity: 0.790, perCapitaTonnes: 1.7, description: 'Eastern Grid · Coal thermal generation dominant' }
    ]
  },

  US: {
    code: 'US',
    name: 'United States',
    flagEmoji: '🇺🇸',
    currencySymbol: '$',
    currencyCode: 'USD',
    nationalGridCarbonIntensity: 0.386, // US EPA eGRID national average
    nationalPerCapitaBaseline: 14.8, // Tonnes CO2e/capita (high historical consumer emissions)
    parisRatificationDate: 'September 3, 2016 (Rejoined February 19, 2021)',
    targetYear2030: '2030',
    emissionsReductionTarget: 'Reduce Net Greenhouse Gas Emissions 50-52% below 2005 levels by 2030',
    baselineYear: '2005',
    netZeroTargetYear: 2050,
    renewableEnergyTarget: '100% Carbon Pollution-Free Electricity by 2035; 50% Zero-Emission Vehicle sales by 2030',
    carbonSinkTarget: 'Conserve at least 30% of US lands and waters by 2030 (America the Beautiful initiative)',
    climateActionTrackerRating: 'Insufficient',
    typicalCookingFuel: 'Residential Natural Gas Range (piped methane) & Electric Induction / Radiant Resistance Stoves',
    typicalHeatingCooling: 'Central HVAC Ducted Heat Pumps, Natural Gas Furnaces, and 3-5 Ton Central Air Conditioning',
    keyPolicyPillars: [
      {
        name: 'Inflation Reduction Act (IRA) of 2022',
        description: '$369 billion federal clean energy package with 10-year uncapped tax credits for clean electricity, EV credits, and heat pump rebates.',
        targetImpact: 'Expected to accelerate US economy-wide GHG reductions to ~40% below 2005 levels by 2030.'
      },
      {
        name: 'EPA Clean Air Act Section 111 Power Plant Standards',
        description: 'New carbon intensity limits on existing coal and new baseload natural gas turbines requiring 90% CCS or hydrogen co-firing.',
        targetImpact: 'Avoidance of 1.38 billion metric tons of CO2 through 2047.'
      },
      {
        name: 'Bipartisan Infrastructure Law (BIL)',
        description: '$65 billion investment in electric grid reliability, regional clean hydrogen hubs, and direct air capture (DAC) demonstration hubs.',
        targetImpact: 'Modernizing 10,000+ miles of high-voltage transmission lines.'
      }
    ],
    subRegions: [
      { id: 'us-ca-bayarea', name: 'California / San Francisco Bay Area', gridCarbonIntensity: 0.215, perCapitaTonnes: 8.9, description: 'CAISO · Over 50% solar, wind, hydro, and geothermal' },
      { id: 'us-ny-nyc', name: 'New York City / NY State', gridCarbonIntensity: 0.230, perCapitaTonnes: 9.4, description: 'NYISO · Major hydro from Niagara & nuclear + offshore wind' },
      { id: 'us-tx-houston', name: 'Houston / Texas (ERCOT)', gridCarbonIntensity: 0.410, perCapitaTonnes: 16.5, description: 'ERCOT · High wind generation mixed with gas and oil refinement' },
      { id: 'us-wa-seattle', name: 'Seattle, Washington (Pacific NW)', gridCarbonIntensity: 0.098, perCapitaTonnes: 7.8, description: 'BPA · 70%+ low-carbon Columbia River hydroelectric power' },
      { id: 'us-il-chicago', name: 'Chicago, Illinois (Midwest)', gridCarbonIntensity: 0.395, perCapitaTonnes: 13.2, description: 'PJM / MISO · Nuclear generation with agricultural wind' }
    ]
  },

  EU: {
    code: 'EU',
    name: 'European Union',
    flagEmoji: '🇪🇺',
    currencySymbol: '€',
    currencyCode: 'EUR',
    nationalGridCarbonIntensity: 0.231, // European Environment Agency (EEA) 2023 avg
    nationalPerCapitaBaseline: 6.8, // Tonnes CO2e/capita
    parisRatificationDate: 'October 5, 2016',
    targetYear2030: '2030',
    emissionsReductionTarget: 'At least 55% net GHG emissions reduction below 1990 levels by 2030 ("Fit for 55")',
    baselineYear: '1990',
    netZeroTargetYear: 2050,
    renewableEnergyTarget: 'At least 42.5% (with ambition to reach 45%) renewable energy share in gross final consumption by 2030 (RED III)',
    carbonSinkTarget: 'Net removals of 310 Mt CO2e in the LULUCF (Land Use and Forestry) sector by 2030',
    climateActionTrackerRating: 'Almost Sufficient',
    typicalCookingFuel: 'Induction cooktops, ceramic electric hobs, and municipal natural gas connections',
    typicalHeatingCooling: 'Hydronic district heating, air-to-water heat pumps, and strict Passive House building envelope standards',
    keyPolicyPillars: [
      {
        name: 'EU Emissions Trading System (EU ETS 2)',
        description: 'World\'s first major carbon market, tightening allowances by 62% by 2030 and expanding into buildings, maritime, and road transport.',
        targetImpact: 'Covers ~40% of EU GHG emissions with carbon price exceeding €60-€85/tonne.'
      },
      {
        name: 'Carbon Border Adjustment Mechanism (CBAM)',
        description: 'Equalizes the price of carbon paid on domestic EU products and imported goods (steel, cement, aluminum, fertilizer, hydrogen).',
        targetImpact: 'Prevents carbon leakage and encourages global industrial decarbonization.'
      },
      {
        name: 'REPowerEU Plan',
        description: 'Rapid phase-out of fossil fuels, joint gas procurement, mandatory rooftop solar on new commercial buildings, and 10 Mt domestic green hydrogen.',
        targetImpact: 'Mobilizing nearly €300 billion in clean transition investments.'
      }
    ],
    subRegions: [
      { id: 'eu-de-berlin', name: 'Berlin, Germany', gridCarbonIntensity: 0.380, perCapitaTonnes: 8.1, description: 'Energiewende · Phasing out coal by 2030, high solar and wind' },
      { id: 'eu-fr-paris', name: 'Paris, France', gridCarbonIntensity: 0.055, perCapitaTonnes: 5.2, description: 'RTE · 70%+ nuclear baseload and hydro; extremely low grid carbon' },
      { id: 'eu-se-stockholm', name: 'Stockholm, Sweden', gridCarbonIntensity: 0.038, perCapitaTonnes: 4.5, description: 'Nord Pool · Hydro, nuclear, and extensive biomass district heating' },
      { id: 'eu-nl-amsterdam', name: 'Amsterdam, Netherlands', gridCarbonIntensity: 0.290, perCapitaTonnes: 7.9, description: 'High North Sea offshore wind expansion; phasing out Groningen gas' },
      { id: 'eu-es-madrid', name: 'Madrid, Spain', gridCarbonIntensity: 0.165, perCapitaTonnes: 5.6, description: 'REE · Over 50% RE generation from solar PV, wind, and pumped hydro' }
    ]
  },

  UK: {
    code: 'UK',
    name: 'United Kingdom',
    flagEmoji: '🇬🇧',
    currencySymbol: '£',
    currencyCode: 'GBP',
    nationalGridCarbonIntensity: 0.180, // National Grid ESO 2023 avg
    nationalPerCapitaBaseline: 5.2, // Tonnes CO2e/capita (down 48% since 1990)
    parisRatificationDate: 'November 18, 2016',
    targetYear2030: '2030',
    emissionsReductionTarget: 'At least 68% reduction in GHG emissions below 1990 levels by 2030 (Sixth Carbon Budget: 78% by 2035)',
    baselineYear: '1990',
    netZeroTargetYear: 2050,
    renewableEnergyTarget: 'Decarbonize electricity system by 2035 (Clean Power 2030 mission); 50 GW offshore wind by 2030',
    carbonSinkTarget: 'Plant 30,000 hectares of trees per year and restore 280,000 hectares of peatlands',
    climateActionTrackerRating: 'Almost Sufficient',
    typicalCookingFuel: 'Electric Induction & Mains Piped Natural Gas',
    typicalHeatingCooling: 'Natural gas combi-boilers transitioning to ground/air-source heat pumps under Boiler Upgrade Scheme',
    keyPolicyPillars: [
      {
        name: 'UK Sixth Carbon Budget (Legally Binding)',
        description: 'First national legislation to incorporate international aviation and shipping emissions, mandating a 78% reduction by 2035.',
        targetImpact: 'World-leading statutory decarbonization framework overseen by the CCC.'
      },
      {
        name: 'Contracts for Difference (CfD) Offshore Wind',
        description: 'Reverse auction mechanism guaranteeing strike prices, driving the UK to become the largest offshore wind operator in Europe (14+ GW).',
        targetImpact: 'Delivers zero-marginal-cost offshore wind power to millions of homes.'
      },
      {
        name: 'Zero Emission Vehicle (ZEV) Mandate',
        description: 'Requires 80% of new cars and 70% of new vans sold in Great Britain to be zero emission by 2030, reaching 100% by 2035.',
        targetImpact: 'Complete decarbonization of domestic light-duty surface transport.'
      }
    ],
    subRegions: [
      { id: 'uk-eng-london', name: 'Greater London, England', gridCarbonIntensity: 0.180, perCapitaTonnes: 4.8, description: 'National Grid ESO · Offshore wind connection and nuclear imports' },
      { id: 'uk-sct-edinburgh', name: 'Edinburgh, Scotland', gridCarbonIntensity: 0.045, perCapitaTonnes: 4.4, description: 'Over 100% equivalent gross electricity generated by onshore/offshore wind' },
      { id: 'uk-wal-cardiff', name: 'Cardiff, Wales', gridCarbonIntensity: 0.190, perCapitaTonnes: 5.6, description: 'Industrial transition corridor with Celtic Sea floating offshore wind' }
    ]
  },

  JP: {
    code: 'JP',
    name: 'Japan',
    flagEmoji: '🇯🇵',
    currencySymbol: '¥',
    currencyCode: 'JPY',
    nationalGridCarbonIntensity: 0.440, // METI / TEPCO national avg
    nationalPerCapitaBaseline: 8.6, // Tonnes CO2e/capita
    parisRatificationDate: 'November 8, 2016',
    targetYear2030: '2030',
    emissionsReductionTarget: 'Reduce GHG emissions by 46% below 2013 levels by 2030 (with ambition to reach 50%)',
    baselineYear: '2013',
    netZeroTargetYear: 2050,
    renewableEnergyTarget: 'Renewable energy to account for 36-38% of total power generation by 2030; Nuclear 20-22%',
    carbonSinkTarget: 'Forest carbon sink measures to absorb 38 million tonnes of CO2e annually by 2030',
    climateActionTrackerRating: 'Insufficient',
    typicalCookingFuel: 'Induction heating (IH) cooktops & City Town Gas (13A liquefied natural gas)',
    typicalHeatingCooling: 'High-COP ductless multi-split inverter heat pumps with EcoCute CO2 refrigerant heat pump water heaters',
    keyPolicyPillars: [
      {
        name: 'GX (Green Transformation) Basic Policy',
        description: '¥150 trillion ($1 trillion) public-private investment over 10 years funded by GX Economic Transition Bonds, carbon pricing, and nuclear restarts.',
        targetImpact: 'Structural industrial transformation to decarbonize heavy manufacturing and power.'
      },
      {
        name: 'Top Runner Program & Energy Efficiency Standards',
        description: 'Mandatory efficiency benchmarks where the best-performing commercial appliance sets the minimum standard for all manufacturers.',
        targetImpact: 'World\'s highest appliance energy efficiency (air conditioners, refrigerators, heat pumps).'
      },
      {
        name: 'Perovskite Solar Cells & Floating Offshore Wind',
        description: 'R&D and deployment subsidies for ultra-lightweight flexible perovskite solar for building facades to overcome land scarcity.',
        targetImpact: 'Maximizes solar generation in densely populated mountainous urban landscapes.'
      }
    ],
    subRegions: [
      { id: 'jp-kanto-tokyo', name: 'Tokyo / Kanto Region', gridCarbonIntensity: 0.420, perCapitaTonnes: 8.1, description: 'TEPCO · Mixed LNG thermal, solar rooftop, and nuclear imports' },
      { id: 'jp-kansai-osaka', name: 'Osaka / Kansai Region', gridCarbonIntensity: 0.330, perCapitaTonnes: 7.9, description: 'KEPCO · Higher share of restarted zero-carbon nuclear reactors' },
      { id: 'jp-hokkaido-sapporo', name: 'Sapporo / Hokkaido', gridCarbonIntensity: 0.490, perCapitaTonnes: 9.8, description: 'Cold climate heating demands; expanding wind and geothermal' }
    ]
  },

  BR: {
    code: 'BR',
    name: 'Brazil',
    flagEmoji: '🇧🇷',
    currencySymbol: 'R$',
    currencyCode: 'BRL',
    nationalGridCarbonIntensity: 0.095, // National Interconnected System (SIN) - exceptionally low carbon grid
    nationalPerCapitaBaseline: 6.2, // Tonnes CO2e/capita (high Land Use Change / Deforestation emissions)
    parisRatificationDate: 'September 21, 2016',
    targetYear2030: '2030',
    emissionsReductionTarget: 'Reduce GHG emissions by 53.1% below 2005 levels by 2030 (Updated NDC 2023)',
    baselineYear: '2005',
    netZeroTargetYear: 2050,
    renewableEnergyTarget: 'Achieve 80-85% renewable share in electricity matrix by 2030 (currently >80% due to hydro)',
    carbonSinkTarget: 'Zero illegal deforestation in the Amazon by 2030; restore 12 million hectares of native vegetation',
    climateActionTrackerRating: 'Almost Sufficient',
    typicalCookingFuel: '13 kg Domestic LPG Cylinders (Botijão de Gás P-13) & Natural Gas in metropolitan pipelines',
    typicalHeatingCooling: 'Natural ventilation, high-efficiency ceiling fans, and split inverter air conditioners in tropical regions',
    keyPolicyPillars: [
      {
        name: 'PPCDAm (Plan for Prevention and Control of Deforestation in the Amazon)',
        description: 'Enforcement through IBAMA satellite monitoring (PRODES/DETER), freezing credit for illegal deforesters, and demarcating indigenous lands.',
        targetImpact: 'Halved Amazon deforestation rates in 2023-2024, preserving the world\'s largest tropical carbon sink.'
      },
      {
        name: 'RenovaBio (National Biofuels Policy)',
        description: 'Decarbonization credits (CBIOs) traded on the B3 stock exchange, incentivizing sugarcane ethanol and advanced biomethane.',
        targetImpact: 'Avoids ~30 million tonnes of transport CO2 emissions annually.'
      },
      {
        name: 'Northeast Wind & Solar Belt',
        description: 'Massive wind corridors in Bahia and Rio Grande do Norte, turning the Brazilian Northeast into a clean hydrogen export powerhouse.',
        targetImpact: 'Over 28 GW of wind capacity installed, displacing thermal peaking plants.'
      }
    ],
    subRegions: [
      { id: 'br-se-saopaulo', name: 'São Paulo (Southeast)', gridCarbonIntensity: 0.088, perCapitaTonnes: 4.8, description: 'SIN Grid · Itaipu hydro + biomass bagasse cogeneration' },
      { id: 'br-se-riodejaneiro', name: 'Rio de Janeiro', gridCarbonIntensity: 0.095, perCapitaTonnes: 5.1, description: 'SIN Grid · Hydro baseload and Angra nuclear power' },
      { id: 'br-ne-salvador', name: 'Salvador, Bahia (Northeast)', gridCarbonIntensity: 0.075, perCapitaTonnes: 4.2, description: 'Dominant onshore wind generation and solar PV farms' }
    ]
  },

  AU: {
    code: 'AU',
    name: 'Australia',
    flagEmoji: '🇦🇺',
    currencySymbol: 'A$',
    currencyCode: 'AUD',
    nationalGridCarbonIntensity: 0.510, // Clean Energy Regulator / NEM average (transitioning from black/brown coal)
    nationalPerCapitaBaseline: 15.1, // Tonnes CO2e/capita (very high per capita fossil export economy)
    parisRatificationDate: 'November 10, 2016',
    targetYear2030: '2030',
    emissionsReductionTarget: 'Reduce net GHG emissions by 43% below 2005 levels by 2030 (Climate Change Act 2022)',
    baselineYear: '2005',
    netZeroTargetYear: 2050,
    renewableEnergyTarget: '82% renewable electricity in the National Electricity Market (NEM) by 2030',
    carbonSinkTarget: 'Nature Positive Plan & Australian Carbon Credit Units (ACCU) scheme protecting native rangelands',
    climateActionTrackerRating: 'Insufficient',
    typicalCookingFuel: 'Electric Induction & Natural Gas cooktops (state bans on new residential gas connections in Victoria & ACT)',
    typicalHeatingCooling: 'Reverse-cycle split system air conditioning and rooftop solar hot water systems',
    keyPolicyPillars: [
      {
        name: 'Rewiring the Nation & Capacity Investment Scheme (CIS)',
        description: '$20 billion funding to modernize transmission lines and underwrite 32 GW of new renewable dispatchable capacity (battery storage + solar/wind).',
        targetImpact: 'Ensures grid reliability as aging coal-fired power stations retire.'
      },
      {
        name: 'Safeguard Mechanism Reform',
        description: 'Mandatory declining emissions baselines (4.9% annual reduction) for Australia\'s 215 largest industrial and mining facilities.',
        targetImpact: '205 million tonnes of net emissions abatement by 2030.'
      },
      {
        name: 'World-Leading Rooftop Solar Penetration',
        description: 'Over 35% of standalone Australian households have rooftop solar PV systems, creating the world\'s highest per-capita residential solar density.',
        targetImpact: 'Generates up to 100% of daytime operational electricity demand in South Australia.'
      }
    ],
    subRegions: [
      { id: 'au-nsw-sydney', name: 'Sydney, New South Wales', gridCarbonIntensity: 0.540, perCapitaTonnes: 14.5, description: 'NEM NSW · Transitioning from Hunter Valley coal to Snowy 2.0 hydro & REZs' },
      { id: 'au-vic-melbourne', name: 'Melbourne, Victoria', gridCarbonIntensity: 0.580, perCapitaTonnes: 14.8, description: 'NEM VIC · Phasing out Latrobe Valley brown coal; residential gas ban active' },
      { id: 'au-sa-adelaide', name: 'Adelaide, South Australia', gridCarbonIntensity: 0.170, perCapitaTonnes: 11.2, description: 'World leader in solar + wind penetration (>70% of generation) with Hornsdale battery' },
      { id: 'au-qld-brisbane', name: 'Brisbane, Queensland', gridCarbonIntensity: 0.560, perCapitaTonnes: 15.6, description: 'NEM QLD · Massive Queensland Energy and Jobs Plan scaling 22 GW renewable' }
    ]
  }
};
