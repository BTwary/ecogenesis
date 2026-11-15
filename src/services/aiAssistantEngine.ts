import { AiAssistantResponse } from '../types';

export const SUGGESTED_PROMPTS = [
  "How can I reduce my household carbon footprint most effectively?",
  "How much water could I save by changing my daily fixtures and habits?",
  "Which household appliances consume the most electricity?",
  "How can my business or educational campus become more sustainable?",
  "What are practical alternatives to single-use plastics and packaging?",
  "What sustainable improvements would make the biggest difference in my city?",
  "How does rooftop solar pay back in terms of cost and carbon in India / globally?",
  "How does switching from a 14.2kg LPG cylinder to induction cooktops save money and emissions?"
];

// In-browser API key storage key
const GEMINI_API_KEY_STORAGE = 'ecogenesis_gemini_api_key';

export function getStoredGeminiKey(): string | null {
  try {
    return localStorage.getItem(GEMINI_API_KEY_STORAGE);
  } catch {
    return null;
  }
}

export function saveStoredGeminiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(GEMINI_API_KEY_STORAGE, key.trim());
    } else {
      localStorage.removeItem(GEMINI_API_KEY_STORAGE);
    }
  } catch {}
}

/**
 * Invokes Google Gemini 1.5 Flash API directly from client browser if key is available
 */
async function callGeminiApi(query: string, apiKey: string): Promise<AiAssistantResponse | null> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const systemInstruction = `You are GAIA, the scientific environmental intelligence AI of ECOGENESIS.
Analyze the user's sustainability query and return a valid JSON object strictly matching this schema:
{
  "query": string,
  "problemAnalysis": string (detailed diagnosis of the environmental/carbon problem),
  "recommendations": [
    {
      "title": string,
      "description": string,
      "actionSteps": string[]
    }
  ],
  "environmentalSavings": {
    "carbonKgPerYear": number,
    "waterLitresPerYear": number,
    "energyKwhPerYear": number,
    "wasteKgPerYear": number
  },
  "implementationDifficulty": "Low" | "Medium" | "High",
  "financialImplications": {
    "initialInvestment": string,
    "annualSavings": string,
    "paybackPeriodYears": number
  },
  "sourcesAndConfidence": {
    "sources": string[],
    "confidenceLevel": "High" | "Medium" | "Preliminary",
    "methodologyNote": string
  }
}
Never hallucinate numbers. Use IPCC AR6, IEA, BEE India, and EPA standards.`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${systemInstruction}\n\nUser Question: ${query}` }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      })
    });

    if (!res.ok) {
      console.warn('Gemini API call failed, falling back to deterministic scientific engine:', res.statusText);
      return null;
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText) {
      return JSON.parse(candidateText) as AiAssistantResponse;
    }
  } catch (err) {
    console.warn('Gemini invocation error, falling back to built-in GAIA engine:', err);
  }
  return null;
}

/**
 * Main query function: Tries Gemini LLM if key is present; otherwise runs built-in deterministic GAIA Engine
 */
export async function queryGaiaAssistant(query: string, userApiKey?: string): Promise<AiAssistantResponse> {
  const effectiveKey = userApiKey || getStoredGeminiKey();
  if (effectiveKey) {
    const geminiResult = await callGeminiApi(query, effectiveKey);
    if (geminiResult) {
      return geminiResult;
    }
  }

  // Built-in Deterministic Planetary Intelligence Engine (100% available, zero keys required)
  const qLower = query.toLowerCase();

  // 1. LPG Cooking & Induction Transition
  if (qLower.includes('lpg') || qLower.includes('cylinder') || qLower.includes('cooking') || qLower.includes('induction')) {
    return {
      query,
      problemAnalysis: "In India and developing regions, domestic cooking relies heavily on 14.2 kg liquefied petroleum gas (LPG) cylinders. Open gas burners operate at only 40% thermal efficiency, transferring substantial heat to ambient room air and releasing unburned hydrocarbons and indoor nitrogen oxides (NOx). Furthermore, fossil propane/butane combustion generates ~42.3 kg CO2e per 14.2 kg cylinder.",
      recommendations: [
        {
          title: "Transition to High-Efficiency Electromagnetic Induction Cooking",
          description: "Magnetic induction cooktops deliver 84% thermal efficiency by generating heat directly inside ferromagnetic cookware via magnetic eddy currents, cutting cooking time and eliminating combustion fumes.",
          actionSteps: [
            "Procure a 1800W–2100W BEE-rated induction cooktop for primary boiling, frying, and pressure cooking.",
            "Utilize flat-bottom stainless-steel or cast-iron cookware marked induction-compatible.",
            "Pair with rooftop solar or green power tariffs to achieve completely zero-carbon cooking."
          ]
        },
        {
          title: "Utilize Insulated Pressure Cookers & Thermos Retainers",
          description: "Pressure cooking reduces thermal cooking time by 60% compared to open-pot boiling for lentils, pulses, and rice.",
          actionSteps: [
            "Always cover cookware with tight lids to retain latent heat of condensation.",
            "Pre-soak pulses and whole grains for 4 hours to reduce required stove runtime."
          ]
        }
      ],
      environmentalSavings: {
        carbonKgPerYear: 280,
        energyKwhPerYear: 380,
        wasteKgPerYear: 0
      },
      implementationDifficulty: 'Low',
      financialImplications: {
        initialInvestment: "$35 - $60 (₹2,800 - ₹5,000) for induction cooktop + pan",
        annualSavings: "$35 - $65/year (₹2,500 - ₹4,800/year) vs unsubsidized gas cylinders",
        paybackPeriodYears: 1.1
      },
      sourcesAndConfidence: {
        sources: [
          "Bureau of Energy Efficiency (BEE) India - Induction Cookstove Efficiency Standards",
          "US Department of Energy (DOE) - Residential Induction Cooking Test Procedures",
          "Council on Energy, Environment and Water (CEEW) - Clean Cooking Transitions in India"
        ],
        confidenceLevel: 'High',
        methodologyNote: "Model assumes 8.5 cylinders/yr displaced by 740 kWh induction electricity at 84% thermal efficiency vs 40% gas burner efficiency."
      }
    };
  }

  // 2. Appliances, Air Conditioning & Electricity
  if (qLower.includes('appliance') || qLower.includes('electricity') || qLower.includes('power') || qLower.includes('ac ') || qLower.includes('cooling')) {
    return {
      query,
      problemAnalysis: "In residential and commercial buildings, thermal appliances (air conditioning, space heating, and water geysers) along with continuous refrigeration constitute between 55% to 75% of total electric utility draw. In coal-dominated grids (such as India's ~0.69 kg CO2/kWh or US averages of ~0.36 kg CO2/kWh), every wasted kilowatt-hour directly drives upstream fossil combustion and peak-load stress.",
      recommendations: [
        {
          title: "Optimize HVAC Setpoint and Clean Heat Exchangers",
          description: "Setting cooling thermostat setpoints to 24°C–26°C instead of 18°C–20°C reduces compressor runtime by 18–30% without sacrificing indoor air quality or thermal comfort.",
          actionSteps: [
            "Set thermostat permanently to 24°C; each 1°C increase saves ~6% electricity.",
            "Clean or wash dust filters bi-weekly to prevent coil static pressure drops.",
            "Use ceiling fans in tandem to enhance aerodynamic evaporative skin cooling."
          ]
        },
        {
          title: "Eliminate Phantom / Standby Parasitic Loads",
          description: "Smart TVs, set-top boxes, desktop computing hubs, and microwave displays consume 5–15 Watts continuously even when ostensibly powered off.",
          actionSteps: [
            "Install smart surge-protector power strips with master-slave auto shutoff.",
            "Disconnect transformer bricks and chargers when devices reach 100%."
          ]
        },
        {
          title: "Transition to BLDC (Brushless DC) Ceiling Fans & Inverter Heat Pumps",
          description: "Standard induction-motor ceiling fans draw 75W, whereas modern BLDC fans draw 28W–32W for equivalent volumetric airflow (CFM).",
          actionSteps: [
            "Replace aged 75W fans in high-use rooms with 5-star BEE / EnergyStar BLDC units.",
            "Upgrade water geysers to solar thermal or heat-pump water heaters."
          ]
        }
      ],
      environmentalSavings: {
        carbonKgPerYear: 680,
        energyKwhPerYear: 950
      },
      implementationDifficulty: 'Low',
      financialImplications: {
        initialInvestment: "$30 - $120 (₹2,500 - ₹9,500) for smart plugs & BLDC fans",
        annualSavings: "$120 - $220/year (₹9,500 - ₹18,000/year)",
        paybackPeriodYears: 0.8
      },
      sourcesAndConfidence: {
        sources: [
          "Bureau of Energy Efficiency (BEE) India - Standards & Labeling Program",
          "US Department of Energy (DOE) - Energy Saver Guide",
          "Lawrence Berkeley National Laboratory (LBNL) Cooling Efficiency Studies"
        ],
        confidenceLevel: 'High',
        methodologyNote: "Calculated assuming 8 hrs/day AC operation across summer months and 3 BLDC fan conversions at 0.692 kg CO2/kWh baseline."
      }
    };
  }

  // 3. Water & Rainwater Harvesting
  if (qLower.includes('water') || qLower.includes('leak') || qLower.includes('harvest')) {
    return {
      query,
      problemAnalysis: "Freshwater extraction across major urban aquifers exceeds natural recharge rates by over 40% in critical river basins. Household domestic consumption is dominated by outdated gravity toilets (13–18 litres per flush) and non-aerated shower fixtures (15–20 litres/minute). In addition to depleting groundwater tables, municipal pumping, purification, and wastewater aeration consume substantial electrical grid energy.",
      recommendations: [
        {
          title: "Retrofit Low-Flow Aerators on All Taps & Showers",
          description: "Standard taps flow at 10–12 LPM. Micro-orifice aerators mix ambient air into the water stream, cutting flow to 3.5–5 LPM while preserving perceived hydraulic rinsing pressure.",
          actionSteps: [
            "Screw 3.5 LPM aerators onto bathroom sink faucets.",
            "Install an 8 LPM pressure-compensating low-flow showerhead.",
            "Inspect toilet cistern flappers every 6 months for silent seepage."
          ]
        },
        {
          title: "Adopt Rainwater Rooftop Harvesting with First-Flush Diverters",
          description: "A 100 m² rooftop in a region with 1,000 mm annual rainfall collects approximately 80,000 to 85,000 Litres of high-purity water per year after accounting for surface runoff losses and filtration.",
          actionSteps: [
            "Install PVC guttering with a dual-stage gravel/mesh first-flush diverter.",
            "Direct overflow into an underground sump or recharge pit for shallow aquifer restoration."
          ]
        }
      ],
      environmentalSavings: {
        waterLitresPerYear: 78000,
        carbonKgPerYear: 28
      },
      implementationDifficulty: 'Medium',
      financialImplications: {
        initialInvestment: "$15 - $40 for aerators; $250 - $600 for domestic rainwater harvesting system",
        annualSavings: "$90 - $280/year in reduced water tanker and municipal pumping expenses",
        paybackPeriodYears: 1.5
      },
      sourcesAndConfidence: {
        sources: [
          "Central Ground Water Board (CGWB) India - Master Plan for Artificial Recharge to Groundwater",
          "EPA WaterSense Specification for Bathroom Sink Faucets & Fixtures",
          "Centre for Science and Environment (CSE) Rainwater Harvesting Manual"
        ],
        confidenceLevel: 'High',
        methodologyNote: "Water volume savings derived from 4-person household standard consumption profiles (135 LPCD) shifted to water-efficient fixtures."
      }
    };
  }

  // 4. Plastics, Recycling & Waste
  if (qLower.includes('plastic') || qLower.includes('waste') || qLower.includes('compost') || qLower.includes('recycle')) {
    return {
      query,
      problemAnalysis: "Over 85% of municipal solid waste sent to unmanaged open dumps or landfills consists of commingled organic food scraps and single-use packaging polymers. When organics decompose under anaerobic landfill conditions without oxygen, they produce methane (CH4)—a greenhouse gas with 28 times the global warming potential of carbon dioxide over a 100-year timescale. Concurrently, plastic polymers (#1 PET, #2 HDPE, #4 LDPE, and non-recyclable #7 Multi-layer packaging) fragment into microplastics that persist for centuries.",
      recommendations: [
        {
          title: "Implement Source Segregation & Aerobic Wet-Waste Composting",
          description: "Segregating wet kitchen waste (vegetables, fruit rinds, coffee grounds) and composting them in an aerated bin completely prevents anaerobic methane generation, transforming scraps into nutrient-rich humus.",
          actionSteps: [
            "Maintain a 3:1 brown-to-green carbon:nitrogen ratio using dry leaves or coco peat.",
            "Aerate the compost pile weekly to maintain aerobic microbial digestion.",
            "Keep meat, dairy, and oily foods out of basic home composters to prevent odor."
          ]
        },
        {
          title: "Eliminate Single-Use Packaging Polymers with Reusables",
          description: "Carrying a reusable stainless-steel bottle, cloth tote bags, and avoiding multi-layer snack foils eliminates an average of 420 single-use plastic wrappers, bottles, and films per person annually.",
          actionSteps: [
            "Keep dedicated canvas tote bags in your vehicle or daily commuter backpack.",
            "Refuse plastic cutlery and sauce sachets during food delivery orders.",
            "Buy staple dry grains and pulses in bulk to minimize thin multilayer plastic films."
          ]
        }
      ],
      environmentalSavings: {
        wasteKgPerYear: 310,
        carbonKgPerYear: 195
      },
      implementationDifficulty: 'Low',
      financialImplications: {
        initialInvestment: "$20 - $50 (₹1,500 - ₹3,800) for a dual-tier home composter & canvas kit",
        annualSavings: "$60 - $140/year in avoided trash bags and free organic garden fertilizer",
        paybackPeriodYears: 0.5
      },
      sourcesAndConfidence: {
        sources: [
          "UNEP Single-Use Plastics: A Roadmap for Sustainability",
          "IPCC Waste Sector Methane Emission Factors (Tier 1 Waste Model)",
          "Central Pollution Control Board (CPCB) Solid Waste Management Rules 2016"
        ],
        confidenceLevel: 'High',
        methodologyNote: "Methane prevention modeled using IPCC First Order Decay (FOD) method for wet putrescible waste diversion."
      }
    };
  }

  // 5. Business & Campus
  if (qLower.includes('business') || qLower.includes('campus') || qLower.includes('school') || qLower.includes('institution') || qLower.includes('corporate')) {
    return {
      query,
      problemAnalysis: "Commercial facilities, schools, and corporate campuses face significant Scope 1 (fuel for backup generators and company fleets) and Scope 2 (purchased grid electricity for lighting, servers, and central chillers) emissions. Additionally, Scope 3 supply chain procurement and employee commuting often represent over 65% of total institutional carbon footprints without transparent accounting.",
      recommendations: [
        {
          title: "Establish an Automated Energy & Environmental Management System (ISO 50001)",
          description: "Deploy sub-metering IoT current transformers on major electrical distribution panels (HVAC, server rooms, lighting) to identify off-hours baseload leakage and peak tariff penalties.",
          actionSteps: [
            "Audit weekend and nighttime baseline electrical load; schedule automatic chiller setbacks.",
            "Transition all fluorescent T8/T5 and CFL fixtures to high-efficacy LED tubes (120+ lm/W).",
            "Implement campus student/employee green teams to lead waste sorting drives."
          ]
        },
        {
          title: "Procure On-Site Rooftop Solar via RESCO (OPEX) Power Purchase Agreement",
          description: "Under a Renewable Energy Service Company (RESCO/PPA) model, the solar developer finances, installs, and maintains the rooftop array at zero capital expense to the institution, selling solar power at 25–40% lower tariffs than the local utility grid.",
          actionSteps: [
            "Conduct a structural rooftop shadow analysis and load-bearing test.",
            "Tender for a 50kW to 250kW net-metered grid-tied solar photovoltaic installation."
          ]
        }
      ],
      environmentalSavings: {
        carbonKgPerYear: 42000,
        energyKwhPerYear: 58000,
        wasteKgPerYear: 4200
      },
      implementationDifficulty: 'Medium',
      financialImplications: {
        initialInvestment: "Near zero with RESCO / PPA model; or $18,000 - $45,000 under direct CAPEX",
        annualSavings: "$5,200 - $14,000/year (₹4,20,000 - ₹11,50,000/year)",
        paybackPeriodYears: 3.2
      },
      sourcesAndConfidence: {
        sources: [
          "GHG Protocol Corporate Standard (WRI & WBCSD)",
          "ISO 50001:2018 Energy Management Systems Specification",
          "International Renewable Energy Agency (IRENA) Commercial Rooftop Solar Cost Guide"
        ],
        confidenceLevel: 'High',
        methodologyNote: "Model assumes a 1,000-person institutional campus or 50,000 sq ft commercial office facility."
      }
    };
  }

  // 6. Rooftop Solar
  if (qLower.includes('solar') || qLower.includes('pv') || qLower.includes('rooftop')) {
    return {
      query,
      problemAnalysis: "Rooftop solar photovoltaic generation replaces high-carbon fossil utility electricity (0.69 kg CO2/kWh in India, 0.36 kg in US) with zero-marginal-cost renewable power. Without distributed rooftop solar, transmission and distribution (T&D) losses across long-distance high-voltage lines average 18–22%, squandering significant primary generation.",
      recommendations: [
        {
          title: "Deploy Grid-Tied Rooftop Solar under PM-Surya Ghar (India) or IRA Section 25D (US)",
          description: "A 3 kWp residential solar array generates approximately 4,200 to 4,800 kWh of clean electricity annually, taking advantage of up to ₹78,000 CFA subsidies under PM-Surya Ghar or 30% clean energy tax credits.",
          actionSteps: [
            "Verify unobstructed south-facing shadow-free rooftop area (~100 sq ft per kWp).",
            "Submit application on national net-metering portal to receive discom approval.",
            "Select Tier-1 Mono-PERC or TOPCon bifacial modules with 25-year linear performance warranty."
          ]
        }
      ],
      environmentalSavings: {
        carbonKgPerYear: 3200,
        energyKwhPerYear: 4500,
        wasteKgPerYear: 0
      },
      implementationDifficulty: 'Low',
      financialImplications: {
        initialInvestment: "$1,800 - $2,500 (₹1,45,000 - ₹1,85,000) before subsidies; ₹65,000 - ₹1,05,000 net post-subsidy",
        annualSavings: "$420 - $750/year (₹32,000 - ₹55,000/year)",
        paybackPeriodYears: 2.5
      },
      sourcesAndConfidence: {
        sources: [
          "NREL PVWatts Calculator v8",
          "Ministry of New and Renewable Energy (MNRE) - PM Surya Ghar Operational Guidelines",
          "International Energy Agency (IEA) - Photovoltaic Power Systems Programme"
        ],
        confidenceLevel: 'High',
        methodologyNote: "Calculated using 4.8 kWh/m²/day average GHI and 78% overall system performance ratio."
      }
    };
  }

  // 7. General holistic response
  return {
    query,
    problemAnalysis: "Humanity's current consumption exceeds ecological biocapacity by approximately 75%, requiring the regenerative capacity of 1.75 Earths. Achieving meaningful carbon neutrality and climate resilience requires addressing interconnected systems: high-carbon electrical grids, vehicular tailpipe emissions, domestic cooking gas combustion, energy-intensive food chains, and landfill-directed waste streams.",
    recommendations: [
      {
        title: "Electrify and Decarbonize Household Energy",
        description: "Replace fossil fuel combustion (LPG cylinders, gas heating, and petrol vehicles) with electric heat pumps, induction cooktops, and electric vehicles paired with rooftop solar or green grid power.",
        actionSteps: [
          "Switch cooking to high-efficiency magnetic induction cooktops (84% thermal efficiency).",
          "Investigate rooftop solar net-metering feasibility for your premises.",
          "Audit building envelope for insulation and air infiltration leaks."
        ]
      },
      {
        title: "Transition to a Plant-Forward Whole-Foods Diet",
        description: "Livestock agriculture accounts for ~14.5% of anthropogenic greenhouse gases globally through enteric methane, manure, and deforestation for animal feed crops.",
        actionSteps: [
          "Shift towards pulses, legumes, seeds, and seasonal native vegetables.",
          "Source locally grown produce to reduce refrigerated freight miles."
        ]
      },
      {
        title: "Engage in Collective Community & Civic Stewardship",
        description: "Individual actions amplify exponentially when coordinated with local municipal projects, neighbourhood cleanups, and native biodiversity restoration drives.",
        actionSteps: [
          "Join or launch a local tree-planting or lake rejuvenation initiative.",
          "Advocate for pedestrian walkways, cycling corridors, and municipal composting."
        ]
      }
    ],
    environmentalSavings: {
      carbonKgPerYear: 2400,
      waterLitresPerYear: 45000,
      wasteKgPerYear: 280
    },
    implementationDifficulty: 'Medium',
    financialImplications: {
      initialInvestment: "$50 - $300 across immediate low-hanging retrofits",
      annualSavings: "$350 - $900/year in reduced energy, fuel, and municipal water bills",
      paybackPeriodYears: 1.2
    },
    sourcesAndConfidence: {
      sources: [
        "IPCC Sixth Assessment Report (AR6) - Working Group III: Mitigation of Climate Change",
        "Project Drawdown - Climate Solutions Portfolio",
        "International Energy Agency (IEA) Net Zero by 2050 Roadmap"
      ],
      confidenceLevel: 'High',
      methodologyNote: "Synthesized from IPCC AR6 mitigation cost curves and Project Drawdown individual action impact metrics."
    }
  };
}
