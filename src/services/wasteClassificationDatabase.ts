import { WasteItem } from '../types';

export const WASTE_DATABASE: WasteItem[] = [
  {
    id: 'w-pet-bottle',
    name: 'PET Water & Beverage Bottles (#1 Polyethylene Terephthalate)',
    category: 'Recyclable',
    preparationInstructions: [
      'Empty completely and rinse out any sticky liquid residue',
      'Crush or flatten bottle to save bin volume',
      'Keep cap screwed on or place in separate small plastic bin depending on local MRF rules',
      'Leave clear label intact for automated optical sorters'
    ],
    recyclingRules: 'High commercial demand. Recycled into rPET polyester fiber, fleece, or new food-grade bottles.',
    commonContaminants: ['Liquid left inside (adds weight and contaminates bales)', 'Non-PET plastic lids mixed in bulk streams', 'Oil or pesticide residue'],
    biodegradationTime: '450 years in landfill; never truly biodegrades in marine environments',
    ecoAlternative: 'Insulated stainless steel or borosilicate glass water bottle'
  },
  {
    id: 'w-greasy-pizza-box',
    name: 'Greasy Pizza Box (Cheese & Oil Saturated)',
    category: 'Compostable / Organic',
    preparationInstructions: [
      'Tear off the clean, unsoiled cardboard top lid — place the clean top in the dry paper recycling stream',
      'Place the oil-stained, cheese-crusted bottom cardboard into your compost bin or municipal organic waste bin',
      'Remove and discard plastic pizza saver tables and greaseproof wax liner sheets'
    ],
    recyclingRules: 'Cardboard soaked with food grease cannot be recycled through standard paper hydropulpers because oil prevents paper fibers from bonding.',
    commonContaminants: ['Plastic condiment tubs and dipping sauce sachets', 'Aluminium foil wraps'],
    biodegradationTime: '2 to 4 months in an active aerobic home compost pile',
    ecoAlternative: 'Dine-in or patronize local pizzerias that use reusable pizza pans or returnable boxes'
  },
  {
    id: 'w-banana-peels-food',
    name: 'Fruit Peels & Vegetable Kitchen Scraps',
    category: 'Compostable / Organic',
    preparationInstructions: [
      'Collect in a breathable countertop compost caddy with a carbon filter',
      'Chop thick rinds (watermelon, pineapple, banana) into smaller 1-inch pieces to accelerate digestion',
      'Mix with 2 to 3 parts dry "brown" matter (dry leaves, shredded non-glossy paper, sawdust)'
    ],
    recyclingRules: 'Must be diverted from municipal landfills to prevent anaerobic methane (CH4) generation. Produces dark organic humus.',
    commonContaminants: ['Produce PLU plastic barcode stickers (always peel off before composting!)', 'Plastic rubber bands and twist ties'],
    biodegradationTime: '3 to 6 weeks in hot aerobic compost; up to 2 years if buried in an anaerobic landfill',
    ecoAlternative: 'Use clean scraps for homemade vegetable broths or citrus peel bio-enzyme cleaning sprays'
  },
  {
    id: 'w-tetra-pak',
    name: 'Tetra Pak & Aseptic Beverage Cartons (Milk, Juice, Soup)',
    category: 'Recyclable',
    preparationInstructions: [
      'Unfold the four corner ears and press flat',
      'Rinse thoroughly with a small splash of greywater to eliminate milk/juice souring',
      'Re-cap or leave opening wide; ensure dry before depositing in curbside bin'
    ],
    recyclingRules: 'Composite material: ~75% virgin paperboard, 20% LDPE polymer, 5% aluminium foil. Separated via specialized hydro-pulpers into paper pulp and PolyAl sheets.',
    commonContaminants: ['Sour liquid spoilage', 'Plastic straws pushed inside (plastic straws are non-recyclable)'],
    biodegradationTime: '25 to 30 years',
    ecoAlternative: 'Refillable glass milk bottles or bulk unpackaged dispensing'
  },
  {
    id: 'w-lithium-batteries',
    name: 'Lithium-Ion & Rechargeable Device Batteries',
    category: 'E-Waste',
    preparationInstructions: [
      'CRITICAL: Never discard in regular household trash or standard curbside recycling bins',
      'Place clear non-conductive electrical tape or scotch tape over both contact terminals to prevent short-circuit sparks',
      'Store in a cool dry container away from flammable materials',
      'Drop off at certified E-waste collection centers, Best Buy, or municipal hazardous drop-offs'
    ],
    recyclingRules: 'Recoverable strategic minerals: Cobalt, Nickel, Lithium, Copper. Discarding in standard bins causes compaction fires in garbage trucks and Material Recovery Facilities (MRFs).',
    commonContaminants: ['Punctured or swollen lithium pouch cells (extreme fire hazard)'],
    biodegradationTime: 'Toxic heavy metals persist indefinitely and leach into groundwater',
    ecoAlternative: 'Maintain battery charge between 20-80% to prolong battery lifespan'
  },
  {
    id: 'w-expanded-polystyrene',
    name: 'Expanded Polystyrene (Styrofoam / EPS Packaging & Cups)',
    category: 'Landfill / Non-Recyclable',
    preparationInstructions: [
      'Inspect for clean white EPS with triangle code #6',
      'Check if local specialist drop-off accepts densified foam; if none exists, place in landfill trash',
      'Do not place in curbside recycling bins — styrofoam breaks into millions of static micro-beads that ruin recycling sorting machinery'
    ],
    recyclingRules: 'Extremely expensive to transport and recycle due to being 95% air. Most municipal MRFs reject all foam.',
    commonContaminants: ['Curbside commingled recycling contamination'],
    biodegradationTime: '500+ years; does not decompose',
    ecoAlternative: 'Mushroom mycelium packaging, molded pulp cardboard, or popcorn cushions'
  },
  {
    id: 'w-alu-cans',
    name: 'Aluminium Beverage Cans',
    category: 'Recyclable',
    preparationInstructions: [
      'Empty completely and lightly rinse',
      'Leave pull-tab attached to the can',
      'Do not crush completely if your regional MRF uses automated eddy-current separators (check local guidelines)'
    ],
    recyclingRules: 'Infinite closed-loop recyclability. Recycling aluminium uses 95% less energy than refining primary bauxite ore. A recycled can is back on retail shelves in 60 days.',
    commonContaminants: ['Cigarette butts pushed inside', 'Commingled stones or dirt'],
    biodegradationTime: '80 to 200 years',
    ecoAlternative: 'Refillable glass carafes or tap filtration'
  },
  {
    id: 'w-glass-jars',
    name: 'Glass Jars & Bottles (Flint, Amber, Green)',
    category: 'Recyclable',
    preparationInstructions: [
      'Rinse food or sauce remnants',
      'Remove metal screw lid and place lid in metal recycling stream',
      'Do not mix with Pyrex, cookware, light bulbs, or window glass (different melting temperatures ruin glass cullet furnaces)'
    ],
    recyclingRules: '100% infinitely recyclable without loss of purity or structural strength.',
    commonContaminants: ['Ceramics, porcelain, Pyrex heat-resistant glass, mirrors, incandescent bulbs'],
    biodegradationTime: 'Over 1,000,000 years (essentially eternal inert silica)',
    ecoAlternative: 'Reuse jars for pantry dry food storage, spice containers, or seedling propagation'
  }
];

export interface VisualScanResult {
  detectedItem: WasteItem;
  confidence: number;
  detectedFeatures: string[];
  localCaveat: string;
}

export function simulateImageClassification(fileName: string): VisualScanResult {
  const fLower = fileName.toLowerCase();
  
  if (fLower.includes('can') || fLower.includes('soda') || fLower.includes('cola') || fLower.includes('alu')) {
    return {
      detectedItem: WASTE_DATABASE[6], // Aluminium can
      confidence: 96.4,
      detectedFeatures: ['Metallic cylinder geometry', 'Reflective cylindrical surface', 'Pull-tab rim pattern'],
      localCaveat: 'Accepted by almost 100% of municipal curbside programs. High circular commodity value.'
    };
  }

  if (fLower.includes('pizza') || fLower.includes('box') || fLower.includes('cardboard')) {
    return {
      detectedItem: WASTE_DATABASE[1], // Pizza box
      confidence: 91.8,
      detectedFeatures: ['Corrugated cellulose structure', 'Oil/grease discoloration pattern', 'Folded cardboard flap'],
      localCaveat: 'Separate clean top for paper recycling; compost grease-stained bottom to avoid paper batch rejection.'
    };
  }

  if (fLower.includes('battery') || fLower.includes('cell') || fLower.includes('power')) {
    return {
      detectedItem: WASTE_DATABASE[4], // Lithium battery
      confidence: 94.2,
      detectedFeatures: ['Cylindrical/prismatic cell format', 'Terminal contact poles', 'Battery classification markings'],
      localCaveat: 'Hazardous Waste! NEVER place in household trash. Drop off at designated e-waste drop-off kiosks.'
    };
  }

  if (fLower.includes('apple') || fLower.includes('banana') || fLower.includes('peel') || fLower.includes('food')) {
    return {
      detectedItem: WASTE_DATABASE[2], // Kitchen scraps
      confidence: 95.0,
      detectedFeatures: ['Organic fibrous cellulose', 'High moisture tissue', 'Natural biological matter'],
      localCaveat: 'Compost in aerobic bin or municipal wet waste collection. Remove plastic PLU stickers!'
    };
  }

  // Default to PET bottle
  return {
    detectedItem: WASTE_DATABASE[0],
    confidence: 88.5,
    detectedFeatures: ['Transparent PET polymer', 'Standard 28mm threaded neck', 'Rigid base with injection gate'],
    localCaveat: 'Curbside recyclable. Empty and rinse before placing in bin. Check local rules regarding bottle caps.'
  };
}
