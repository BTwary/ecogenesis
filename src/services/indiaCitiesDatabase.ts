export interface IndiaCityInfo {
  id: string;
  name: string;
  stateOrUT: string;
  type: 'State Capital' | 'UT Capital' | 'Tier 1' | 'Tier 2' | 'Tier 3';
  zone: 'North' | 'South' | 'West' | 'East' | 'Central' | 'North-East' | 'Islands';
  lat: number;
  lon: number;
  gridRegion: 'Northern Grid' | 'Western Grid' | 'Southern Grid' | 'Eastern Grid' | 'North-Eastern Grid' | 'Island Microgrid';
  gridCarbonIntensity: number; // kg CO2e / kWh (CEA Baseline Database v19)
  perCapitaTonnes: number; // State-level annual per-capita GHG emissions
  riverBasin: string;
  annualRainfallMm: number; // IMD climatological normal
  cpcbStationCode?: string;
}

export const INDIA_CITIES_DATABASE: IndiaCityInfo[] = [
  // ==========================================
  // 1. ALL 28 STATE CAPITALS
  // ==========================================
  {
    id: 'in-ap-amaravati',
    name: 'Amaravati / Vijayawada',
    stateOrUT: 'Andhra Pradesh',
    type: 'State Capital',
    zone: 'South',
    lat: 16.5417,
    lon: 80.5158,
    gridRegion: 'Southern Grid',
    gridCarbonIntensity: 0.670,
    perCapitaTonnes: 1.85,
    riverBasin: 'Krishna Basin',
    annualRainfallMm: 1030
  },
  {
    id: 'in-ar-itanagar',
    name: 'Itanagar',
    stateOrUT: 'Arunachal Pradesh',
    type: 'State Capital',
    zone: 'North-East',
    lat: 27.0844,
    lon: 93.6053,
    gridRegion: 'North-Eastern Grid',
    gridCarbonIntensity: 0.380, // High hydro penetration
    perCapitaTonnes: 1.10,
    riverBasin: 'Brahmaputra Basin',
    annualRainfallMm: 2800
  },
  {
    id: 'in-as-dispur',
    name: 'Dispur / Guwahati',
    stateOrUT: 'Assam',
    type: 'State Capital',
    zone: 'North-East',
    lat: 26.1445,
    lon: 91.7362,
    gridRegion: 'North-Eastern Grid',
    gridCarbonIntensity: 0.520,
    perCapitaTonnes: 1.15,
    riverBasin: 'Brahmaputra Basin',
    annualRainfallMm: 1720,
    cpcbStationCode: 'AS-CPCB-GHY'
  },
  {
    id: 'in-br-patna',
    name: 'Patna',
    stateOrUT: 'Bihar',
    type: 'State Capital',
    zone: 'East',
    lat: 25.5941,
    lon: 85.1376,
    gridRegion: 'Eastern Grid',
    gridCarbonIntensity: 0.770,
    perCapitaTonnes: 0.75,
    riverBasin: 'Ganga Basin',
    annualRainfallMm: 1130,
    cpcbStationCode: 'BR-CPCB-PAT'
  },
  {
    id: 'in-cg-raipur',
    name: 'Raipur',
    stateOrUT: 'Chhattisgarh',
    type: 'State Capital',
    zone: 'Central',
    lat: 21.2514,
    lon: 81.6296,
    gridRegion: 'Western Grid',
    gridCarbonIntensity: 0.820, // Coal mining & thermal heavy
    perCapitaTonnes: 2.70,
    riverBasin: 'Mahanadi Basin',
    annualRainfallMm: 1320
  },
  {
    id: 'in-ga-panaji',
    name: 'Panaji',
    stateOrUT: 'Goa',
    type: 'State Capital',
    zone: 'West',
    lat: 15.4909,
    lon: 73.8278,
    gridRegion: 'Western Grid',
    gridCarbonIntensity: 0.690,
    perCapitaTonnes: 3.40, // High tourism & transport intensity
    riverBasin: 'Mandovi / Zuari Basin',
    annualRainfallMm: 3000
  },
  {
    id: 'in-gj-gandhinagar',
    name: 'Gandhinagar / Ahmedabad',
    stateOrUT: 'Gujarat',
    type: 'State Capital',
    zone: 'West',
    lat: 23.2156,
    lon: 72.6369,
    gridRegion: 'Western Grid',
    gridCarbonIntensity: 0.730,
    perCapitaTonnes: 2.65,
    riverBasin: 'Sabarmati Basin',
    annualRainfallMm: 780,
    cpcbStationCode: 'GJ-CPCB-AHM'
  },
  {
    id: 'in-hr-chandigarh',
    name: 'Chandigarh (Haryana / Punjab)',
    stateOrUT: 'Haryana',
    type: 'State Capital',
    zone: 'North',
    lat: 30.7333,
    lon: 76.7794,
    gridRegion: 'Northern Grid',
    gridCarbonIntensity: 0.710,
    perCapitaTonnes: 2.50,
    riverBasin: 'Ghaggar Basin',
    annualRainfallMm: 1050
  },
  {
    id: 'in-hp-shimla',
    name: 'Shimla',
    stateOrUT: 'Himachal Pradesh',
    type: 'State Capital',
    zone: 'North',
    lat: 31.1048,
    lon: 77.1734,
    gridRegion: 'Northern Grid',
    gridCarbonIntensity: 0.350, // 100% clean hydropower surplus state
    perCapitaTonnes: 1.30,
    riverBasin: 'Indus / Sutlej Basin',
    annualRainfallMm: 1480
  },
  {
    id: 'in-jh-ranchi',
    name: 'Ranchi',
    stateOrUT: 'Jharkhand',
    type: 'State Capital',
    zone: 'East',
    lat: 23.3441,
    lon: 85.3096,
    gridRegion: 'Eastern Grid',
    gridCarbonIntensity: 0.810,
    perCapitaTonnes: 1.80,
    riverBasin: 'Subarnarekha Basin',
    annualRainfallMm: 1430
  },
  {
    id: 'in-ka-bengaluru',
    name: 'Bengaluru',
    stateOrUT: 'Karnataka',
    type: 'State Capital',
    zone: 'South',
    lat: 12.9716,
    lon: 77.5946,
    gridRegion: 'Southern Grid',
    gridCarbonIntensity: 0.640,
    perCapitaTonnes: 1.75,
    riverBasin: 'Cauvery / Arkavathi Basin',
    annualRainfallMm: 970,
    cpcbStationCode: 'KA-CPCB-003'
  },
  {
    id: 'in-kl-thiruvananthapuram',
    name: 'Thiruvananthapuram',
    stateOrUT: 'Kerala',
    type: 'State Capital',
    zone: 'South',
    lat: 8.5241,
    lon: 76.9366,
    gridRegion: 'Southern Grid',
    gridCarbonIntensity: 0.580,
    perCapitaTonnes: 1.45,
    riverBasin: 'Karamana Basin',
    annualRainfallMm: 1820
  },
  {
    id: 'in-mp-bhopal',
    name: 'Bhopal',
    stateOrUT: 'Madhya Pradesh',
    type: 'State Capital',
    zone: 'Central',
    lat: 23.2599,
    lon: 77.4126,
    gridRegion: 'Western Grid',
    gridCarbonIntensity: 0.740,
    perCapitaTonnes: 1.65,
    riverBasin: 'Betwa / Narmada Basin',
    annualRainfallMm: 1140
  },
  {
    id: 'in-mh-mumbai',
    name: 'Mumbai',
    stateOrUT: 'Maharashtra',
    type: 'State Capital',
    zone: 'West',
    lat: 19.0760,
    lon: 72.8777,
    gridRegion: 'Western Grid',
    gridCarbonIntensity: 0.720,
    perCapitaTonnes: 2.15,
    riverBasin: 'Ulhas / Mithi Basin',
    annualRainfallMm: 2420,
    cpcbStationCode: 'MH-CPCB-002'
  },
  {
    id: 'in-mn-imphal',
    name: 'Imphal',
    stateOrUT: 'Manipur',
    type: 'State Capital',
    zone: 'North-East',
    lat: 24.8170,
    lon: 93.9368,
    gridRegion: 'North-Eastern Grid',
    gridCarbonIntensity: 0.440,
    perCapitaTonnes: 0.85,
    riverBasin: 'Barak / Manipur Basin',
    annualRainfallMm: 1450
  },
  {
    id: 'in-ml-shillong',
    name: 'Shillong',
    stateOrUT: 'Meghalaya',
    type: 'State Capital',
    zone: 'North-East',
    lat: 25.5788,
    lon: 91.8933,
    gridRegion: 'North-Eastern Grid',
    gridCarbonIntensity: 0.390,
    perCapitaTonnes: 1.05,
    riverBasin: 'Brahmaputra / Umiam Basin',
    annualRainfallMm: 2400
  },
  {
    id: 'in-mz-aizawl',
    name: 'Aizawl',
    stateOrUT: 'Mizoram',
    type: 'State Capital',
    zone: 'North-East',
    lat: 23.7271,
    lon: 92.7176,
    gridRegion: 'North-Eastern Grid',
    gridCarbonIntensity: 0.410,
    perCapitaTonnes: 0.80,
    riverBasin: 'Tlawng Basin',
    annualRainfallMm: 2100
  },
  {
    id: 'in-nl-kohima',
    name: 'Kohima',
    stateOrUT: 'Nagaland',
    type: 'State Capital',
    zone: 'North-East',
    lat: 25.6751,
    lon: 94.1086,
    gridRegion: 'North-Eastern Grid',
    gridCarbonIntensity: 0.430,
    perCapitaTonnes: 0.82,
    riverBasin: 'Dhansiri Basin',
    annualRainfallMm: 1800
  },
  {
    id: 'in-od-bhubaneswar',
    name: 'Bhubaneswar',
    stateOrUT: 'Odisha',
    type: 'State Capital',
    zone: 'East',
    lat: 20.2961,
    lon: 85.8245,
    gridRegion: 'Eastern Grid',
    gridCarbonIntensity: 0.790,
    perCapitaTonnes: 2.20,
    riverBasin: 'Mahanadi / Daya Basin',
    annualRainfallMm: 1540
  },
  {
    id: 'in-rj-jaipur',
    name: 'Jaipur',
    stateOrUT: 'Rajasthan',
    type: 'State Capital',
    zone: 'North',
    lat: 26.9124,
    lon: 75.7873,
    gridRegion: 'Northern Grid',
    gridCarbonIntensity: 0.690, // Heavy solar capacity (Bhadla)
    perCapitaTonnes: 1.95,
    riverBasin: 'Banas / Dravyavati Basin',
    annualRainfallMm: 600,
    cpcbStationCode: 'RJ-CPCB-JAI'
  },
  {
    id: 'in-sk-gangtok',
    name: 'Gangtok',
    stateOrUT: 'Sikkim',
    type: 'State Capital',
    zone: 'North-East',
    lat: 27.3314,
    lon: 88.6138,
    gridRegion: 'Eastern Grid',
    gridCarbonIntensity: 0.310, // 100% organic state, high hydro
    perCapitaTonnes: 1.10,
    riverBasin: 'Teesta Basin',
    annualRainfallMm: 3500
  },
  {
    id: 'in-tn-chennai',
    name: 'Chennai',
    stateOrUT: 'Tamil Nadu',
    type: 'State Capital',
    zone: 'South',
    lat: 13.0827,
    lon: 80.2707,
    gridRegion: 'Southern Grid',
    gridCarbonIntensity: 0.650,
    perCapitaTonnes: 1.95,
    riverBasin: 'Cooum / Adyar Basin',
    annualRainfallMm: 1400,
    cpcbStationCode: 'TN-CPCB-CHE'
  },
  {
    id: 'in-tg-hyderabad',
    name: 'Hyderabad',
    stateOrUT: 'Telangana',
    type: 'State Capital',
    zone: 'South',
    lat: 17.3850,
    lon: 78.4867,
    gridRegion: 'Southern Grid',
    gridCarbonIntensity: 0.710,
    perCapitaTonnes: 1.85,
    riverBasin: 'Musi / Krishna Basin',
    annualRainfallMm: 820
  },
  {
    id: 'in-tr-agartala',
    name: 'Agartala',
    stateOrUT: 'Tripura',
    type: 'State Capital',
    zone: 'North-East',
    lat: 23.8315,
    lon: 91.2868,
    gridRegion: 'North-Eastern Grid',
    gridCarbonIntensity: 0.480,
    perCapitaTonnes: 0.90,
    riverBasin: 'Howrah Basin',
    annualRainfallMm: 2200
  },
  {
    id: 'in-up-lucknow',
    name: 'Lucknow',
    stateOrUT: 'Uttar Pradesh',
    type: 'State Capital',
    zone: 'North',
    lat: 26.8467,
    lon: 80.9462,
    gridRegion: 'Northern Grid',
    gridCarbonIntensity: 0.750,
    perCapitaTonnes: 1.25,
    riverBasin: 'Gomti / Ganga Basin',
    annualRainfallMm: 1010,
    cpcbStationCode: 'UP-CPCB-LKO'
  },
  {
    id: 'in-uk-dehradun',
    name: 'Dehradun',
    stateOrUT: 'Uttarakhand',
    type: 'State Capital',
    zone: 'North',
    lat: 30.3165,
    lon: 78.0322,
    gridRegion: 'Northern Grid',
    gridCarbonIntensity: 0.420, // Hydro rich
    perCapitaTonnes: 1.40,
    riverBasin: 'Ganga / Yamuna Basin',
    annualRainfallMm: 2050
  },
  {
    id: 'in-wb-kolkata',
    name: 'Kolkata',
    stateOrUT: 'West Bengal',
    type: 'State Capital',
    zone: 'East',
    lat: 22.5726,
    lon: 88.3639,
    gridRegion: 'Eastern Grid',
    gridCarbonIntensity: 0.780,
    perCapitaTonnes: 1.55,
    riverBasin: 'Hooghly / Ganga Basin',
    annualRainfallMm: 1750,
    cpcbStationCode: 'WB-CPCB-004'
  },

  // ==========================================
  // 2. ALL 8 UNION TERRITORY CAPITALS / HUBS
  // ==========================================
  {
    id: 'in-dl-delhi',
    name: 'Delhi National Capital Region (NCR)',
    stateOrUT: 'Delhi NCT',
    type: 'UT Capital',
    zone: 'North',
    lat: 28.6139,
    lon: 77.2090,
    gridRegion: 'Northern Grid',
    gridCarbonIntensity: 0.713,
    perCapitaTonnes: 2.85,
    riverBasin: 'Yamuna / Ganga Basin',
    annualRainfallMm: 790,
    cpcbStationCode: 'DL-CPCB-001'
  },
  {
    id: 'in-jk-srinagar',
    name: 'Srinagar (Jammu & Kashmir)',
    stateOrUT: 'Jammu and Kashmir',
    type: 'UT Capital',
    zone: 'North',
    lat: 34.0837,
    lon: 74.7973,
    gridRegion: 'Northern Grid',
    gridCarbonIntensity: 0.390,
    perCapitaTonnes: 1.20,
    riverBasin: 'Jhelum Basin',
    annualRainfallMm: 710
  },
  {
    id: 'in-jk-jammu',
    name: 'Jammu',
    stateOrUT: 'Jammu and Kashmir',
    type: 'UT Capital',
    zone: 'North',
    lat: 32.7266,
    lon: 74.8570,
    gridRegion: 'Northern Grid',
    gridCarbonIntensity: 0.450,
    perCapitaTonnes: 1.30,
    riverBasin: 'Tawi Basin',
    annualRainfallMm: 1100
  },
  {
    id: 'in-la-leh',
    name: 'Leh (Ladakh)',
    stateOrUT: 'Ladakh',
    type: 'UT Capital',
    zone: 'North',
    lat: 34.1526,
    lon: 77.5771,
    gridRegion: 'Northern Grid',
    gridCarbonIntensity: 0.320, // High solar altitude flux
    perCapitaTonnes: 1.00,
    riverBasin: 'Indus Basin',
    annualRainfallMm: 100 // High-altitude cold desert
  },
  {
    id: 'in-ch-chandigarh-ut',
    name: 'Chandigarh UT',
    stateOrUT: 'Chandigarh',
    type: 'UT Capital',
    zone: 'North',
    lat: 30.7333,
    lon: 76.7794,
    gridRegion: 'Northern Grid',
    gridCarbonIntensity: 0.710,
    perCapitaTonnes: 2.60,
    riverBasin: 'Ghaggar Basin',
    annualRainfallMm: 1050
  },
  {
    id: 'in-py-puducherry',
    name: 'Puducherry',
    stateOrUT: 'Puducherry',
    type: 'UT Capital',
    zone: 'South',
    lat: 11.9416,
    lon: 79.8083,
    gridRegion: 'Southern Grid',
    gridCarbonIntensity: 0.660,
    perCapitaTonnes: 2.10,
    riverBasin: 'Gingee / Bay of Bengal',
    annualRainfallMm: 1350
  },
  {
    id: 'in-an-port-blair',
    name: 'Port Blair',
    stateOrUT: 'Andaman and Nicobar',
    type: 'UT Capital',
    zone: 'Islands',
    lat: 11.6234,
    lon: 92.7265,
    gridRegion: 'Island Microgrid',
    gridCarbonIntensity: 0.750, // Diesel generators transitioning to solar
    perCapitaTonnes: 1.90,
    riverBasin: 'Island Coastal Watershed',
    annualRainfallMm: 2900
  },
  {
    id: 'in-ld-kavaratti',
    name: 'Kavaratti',
    stateOrUT: 'Lakshadweep',
    type: 'UT Capital',
    zone: 'Islands',
    lat: 10.5667,
    lon: 72.6417,
    gridRegion: 'Island Microgrid',
    gridCarbonIntensity: 0.740,
    perCapitaTonnes: 1.50,
    riverBasin: 'Atoll Lens Freshwater',
    annualRainfallMm: 1600
  },
  {
    id: 'in-dd-daman',
    name: 'Daman & Diu',
    stateOrUT: 'Dadra and Nagar Haveli and Daman and Diu',
    type: 'UT Capital',
    zone: 'West',
    lat: 20.3974,
    lon: 72.8328,
    gridRegion: 'Western Grid',
    gridCarbonIntensity: 0.720,
    perCapitaTonnes: 2.40,
    riverBasin: 'Daman Ganga Basin',
    annualRainfallMm: 1950
  },

  // ==========================================
  // 3. KEY TIER 2 CITIES ACROSS ALL REGIONS
  // ==========================================
  {
    id: 'in-mh-pune',
    name: 'Pune',
    stateOrUT: 'Maharashtra',
    type: 'Tier 2',
    zone: 'West',
    lat: 18.5204,
    lon: 73.8567,
    gridRegion: 'Western Grid',
    gridCarbonIntensity: 0.710,
    perCapitaTonnes: 2.05,
    riverBasin: 'Mula-Mutha / Krishna Basin',
    annualRainfallMm: 720
  },
  {
    id: 'in-gj-surat',
    name: 'Surat',
    stateOrUT: 'Gujarat',
    type: 'Tier 2',
    zone: 'West',
    lat: 21.1702,
    lon: 72.8311,
    gridRegion: 'Western Grid',
    gridCarbonIntensity: 0.730,
    perCapitaTonnes: 2.45,
    riverBasin: 'Tapi Basin',
    annualRainfallMm: 1150
  },
  {
    id: 'in-mp-indore',
    name: 'Indore',
    stateOrUT: 'Madhya Pradesh',
    type: 'Tier 2',
    zone: 'Central',
    lat: 22.7196,
    lon: 75.8577,
    gridRegion: 'Western Grid',
    gridCarbonIntensity: 0.730,
    perCapitaTonnes: 1.70, // Cleanest city in India award
    riverBasin: 'Khan / Narmada Basin',
    annualRainfallMm: 950
  },
  {
    id: 'in-tn-coimbatore',
    name: 'Coimbatore',
    stateOrUT: 'Tamil Nadu',
    type: 'Tier 2',
    zone: 'South',
    lat: 11.0168,
    lon: 76.9558,
    gridRegion: 'Southern Grid',
    gridCarbonIntensity: 0.630, // High wind energy penetration
    perCapitaTonnes: 1.90,
    riverBasin: 'Noyyal / Cauvery Basin',
    annualRainfallMm: 650
  },
  {
    id: 'in-kl-kochi',
    name: 'Kochi (Cochin)',
    stateOrUT: 'Kerala',
    type: 'Tier 2',
    zone: 'South',
    lat: 9.9312,
    lon: 76.2673,
    gridRegion: 'Southern Grid',
    gridCarbonIntensity: 0.580, // World first 100% solar airport (CIAL)
    perCapitaTonnes: 1.60,
    riverBasin: 'Periyar Basin',
    annualRainfallMm: 3100
  },
  {
    id: 'in-ap-visakhapatnam',
    name: 'Visakhapatnam (Vizag)',
    stateOrUT: 'Andhra Pradesh',
    type: 'Tier 2',
    zone: 'South',
    lat: 17.6868,
    lon: 83.2185,
    gridRegion: 'Southern Grid',
    gridCarbonIntensity: 0.680,
    perCapitaTonnes: 2.10,
    riverBasin: 'Gosthani / Coastal Basin',
    annualRainfallMm: 1110
  },
  {
    id: 'in-mh-nagpur',
    name: 'Nagpur',
    stateOrUT: 'Maharashtra',
    type: 'Tier 2',
    zone: 'Central',
    lat: 21.1458,
    lon: 79.0882,
    gridRegion: 'Western Grid',
    gridCarbonIntensity: 0.740,
    perCapitaTonnes: 1.95,
    riverBasin: 'Nag / Kanhan / Godavari Basin',
    annualRainfallMm: 1160
  },
  {
    id: 'in-up-varanasi',
    name: 'Varanasi (Kashi)',
    stateOrUT: 'Uttar Pradesh',
    type: 'Tier 2',
    zone: 'North',
    lat: 25.3176,
    lon: 82.9739,
    gridRegion: 'Northern Grid',
    gridCarbonIntensity: 0.740,
    perCapitaTonnes: 1.20,
    riverBasin: 'Ganga Basin',
    annualRainfallMm: 1050
  },
  {
    id: 'in-up-kanpur',
    name: 'Kanpur',
    stateOrUT: 'Uttar Pradesh',
    type: 'Tier 2',
    zone: 'North',
    lat: 26.4499,
    lon: 80.3319,
    gridRegion: 'Northern Grid',
    gridCarbonIntensity: 0.760,
    perCapitaTonnes: 1.35,
    riverBasin: 'Ganga Basin',
    annualRainfallMm: 850
  },
  {
    id: 'in-up-agra',
    name: 'Agra',
    stateOrUT: 'Uttar Pradesh',
    type: 'Tier 2',
    zone: 'North',
    lat: 27.1767,
    lon: 78.0081,
    gridRegion: 'Northern Grid',
    gridCarbonIntensity: 0.730, // Taj Trapezium Zone (TTZ) emission controls
    perCapitaTonnes: 1.25,
    riverBasin: 'Yamuna Basin',
    annualRainfallMm: 680
  },
  {
    id: 'in-ka-mysuru',
    name: 'Mysuru (Mysore)',
    stateOrUT: 'Karnataka',
    type: 'Tier 2',
    zone: 'South',
    lat: 12.2958,
    lon: 76.6394,
    gridRegion: 'Southern Grid',
    gridCarbonIntensity: 0.620,
    perCapitaTonnes: 1.50,
    riverBasin: 'Kabini / Cauvery Basin',
    annualRainfallMm: 800
  },
  {
    id: 'in-tn-madurai',
    name: 'Madurai',
    stateOrUT: 'Tamil Nadu',
    type: 'Tier 2',
    zone: 'South',
    lat: 9.9252,
    lon: 78.1198,
    gridRegion: 'Southern Grid',
    gridCarbonIntensity: 0.650,
    perCapitaTonnes: 1.70,
    riverBasin: 'Vaigai Basin',
    annualRainfallMm: 850
  },
  {
    id: 'in-pb-amritsar',
    name: 'Amritsar',
    stateOrUT: 'Punjab',
    type: 'Tier 2',
    zone: 'North',
    lat: 31.6340,
    lon: 74.8723,
    gridRegion: 'Northern Grid',
    gridCarbonIntensity: 0.720,
    perCapitaTonnes: 2.25,
    riverBasin: 'Ravi / Beas Basin',
    annualRainfallMm: 690
  },
  {
    id: 'in-rj-jodhpur',
    name: 'Jodhpur',
    stateOrUT: 'Rajasthan',
    type: 'Tier 2',
    zone: 'North',
    lat: 26.2389,
    lon: 73.0243,
    gridRegion: 'Northern Grid',
    gridCarbonIntensity: 0.670, // High solar irradiation
    perCapitaTonnes: 1.85,
    riverBasin: 'Luni Basin',
    annualRainfallMm: 360
  },
  {
    id: 'in-jh-jamshedpur',
    name: 'Jamshedpur (Tatanagar)',
    stateOrUT: 'Jharkhand',
    type: 'Tier 2',
    zone: 'East',
    lat: 22.8046,
    lon: 86.2029,
    gridRegion: 'Eastern Grid',
    gridCarbonIntensity: 0.830, // Industrial steel center
    perCapitaTonnes: 2.50,
    riverBasin: 'Subarnarekha Basin',
    annualRainfallMm: 1350
  },

  // ==========================================
  // 4. KEY TIER 3 CITIES & ECOLOGICAL HUBS
  // ==========================================
  {
    id: 'in-uk-rishikesh',
    name: 'Rishikesh / Haridwar',
    stateOrUT: 'Uttarakhand',
    type: 'Tier 3',
    zone: 'North',
    lat: 30.0869,
    lon: 78.2676,
    gridRegion: 'Northern Grid',
    gridCarbonIntensity: 0.390,
    perCapitaTonnes: 1.25,
    riverBasin: 'Ganga Basin',
    annualRainfallMm: 2130
  },
  {
    id: 'in-mp-ujjain',
    name: 'Ujjain',
    stateOrUT: 'Madhya Pradesh',
    type: 'Tier 3',
    zone: 'Central',
    lat: 23.1765,
    lon: 75.7885,
    gridRegion: 'Western Grid',
    gridCarbonIntensity: 0.740,
    perCapitaTonnes: 1.45,
    riverBasin: 'Shipra / Chambal Basin',
    annualRainfallMm: 920
  },
  {
    id: 'in-br-gaya',
    name: 'Gaya / Bodh Gaya',
    stateOrUT: 'Bihar',
    type: 'Tier 3',
    zone: 'East',
    lat: 24.7955,
    lon: 85.0002,
    gridRegion: 'Eastern Grid',
    gridCarbonIntensity: 0.770,
    perCapitaTonnes: 0.70,
    riverBasin: 'Falgu Basin',
    annualRainfallMm: 1100
  },
  {
    id: 'in-wb-siliguri',
    name: 'Siliguri (North Bengal Gateway)',
    stateOrUT: 'West Bengal',
    type: 'Tier 3',
    zone: 'East',
    lat: 26.7271,
    lon: 88.3953,
    gridRegion: 'Eastern Grid',
    gridCarbonIntensity: 0.650,
    perCapitaTonnes: 1.20,
    riverBasin: 'Mahananda / Teesta Basin',
    annualRainfallMm: 3300
  },
  {
    id: 'in-hr-panipat',
    name: 'Panipat',
    stateOrUT: 'Haryana',
    type: 'Tier 3',
    zone: 'North',
    lat: 29.3909,
    lon: 76.9635,
    gridRegion: 'Northern Grid',
    gridCarbonIntensity: 0.740,
    perCapitaTonnes: 2.10,
    riverBasin: 'Yamuna Basin',
    annualRainfallMm: 620
  },
  {
    id: 'in-rj-udaipur',
    name: 'Udaipur (City of Lakes)',
    stateOrUT: 'Rajasthan',
    type: 'Tier 3',
    zone: 'North',
    lat: 24.5854,
    lon: 73.7125,
    gridRegion: 'Northern Grid',
    gridCarbonIntensity: 0.680,
    perCapitaTonnes: 1.70,
    riverBasin: 'Berach / Banas Basin',
    annualRainfallMm: 640
  },
  {
    id: 'in-ka-shivamogga',
    name: 'Shivamogga (Shimoga)',
    stateOrUT: 'Karnataka',
    type: 'Tier 3',
    zone: 'South',
    lat: 13.9299,
    lon: 75.5681,
    gridRegion: 'Southern Grid',
    gridCarbonIntensity: 0.610,
    perCapitaTonnes: 1.40,
    riverBasin: 'Tunga / Bhadra Basin',
    annualRainfallMm: 1800
  },
  {
    id: 'in-tn-salem',
    name: 'Salem',
    stateOrUT: 'Tamil Nadu',
    type: 'Tier 3',
    zone: 'South',
    lat: 11.6643,
    lon: 78.1460,
    gridRegion: 'Southern Grid',
    gridCarbonIntensity: 0.650,
    perCapitaTonnes: 1.75,
    riverBasin: 'Thirumanimutharu / Cauvery Basin',
    annualRainfallMm: 950
  },
  {
    id: 'in-kl-alappuzha',
    name: 'Alappuzha (Alleppey - Backwaters)',
    stateOrUT: 'Kerala',
    type: 'Tier 3',
    zone: 'South',
    lat: 9.4981,
    lon: 76.3388,
    gridRegion: 'Southern Grid',
    gridCarbonIntensity: 0.570,
    perCapitaTonnes: 1.35,
    riverBasin: 'Pamba / Vembanad Wetland Basin',
    annualRainfallMm: 2950
  },
  {
    id: 'in-tg-warangal',
    name: 'Warangal',
    stateOrUT: 'Telangana',
    type: 'Tier 3',
    zone: 'South',
    lat: 17.9689,
    lon: 79.5941,
    gridRegion: 'Southern Grid',
    gridCarbonIntensity: 0.700,
    perCapitaTonnes: 1.60,
    riverBasin: 'Godavari Basin',
    annualRainfallMm: 990
  },
  {
    id: 'in-mh-aurangabad',
    name: 'Chhatrapati Sambhaji Nagar (Aurangabad)',
    stateOrUT: 'Maharashtra',
    type: 'Tier 3',
    zone: 'West',
    lat: 19.8762,
    lon: 75.3433,
    gridRegion: 'Western Grid',
    gridCarbonIntensity: 0.720,
    perCapitaTonnes: 1.80,
    riverBasin: 'Kham / Godavari Basin',
    annualRainfallMm: 730
  },
  {
    id: 'in-cg-bilaspur',
    name: 'Bilaspur',
    stateOrUT: 'Chhattisgarh',
    type: 'Tier 3',
    zone: 'Central',
    lat: 22.0797,
    lon: 82.1409,
    gridRegion: 'Western Grid',
    gridCarbonIntensity: 0.810,
    perCapitaTonnes: 2.20,
    riverBasin: 'Arpa / Mahanadi Basin',
    annualRainfallMm: 1250
  }
];

export function findCityById(id: string): IndiaCityInfo | undefined {
  return INDIA_CITIES_DATABASE.find(c => c.id === id);
}

export function searchCities(term: string): IndiaCityInfo[] {
  const t = term.toLowerCase().trim();
  if (!t) return INDIA_CITIES_DATABASE;
  return INDIA_CITIES_DATABASE.filter(c => 
    c.name.toLowerCase().includes(t) || 
    c.stateOrUT.toLowerCase().includes(t) ||
    c.riverBasin.toLowerCase().includes(t) ||
    c.type.toLowerCase().includes(t)
  );
}
