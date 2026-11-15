import React, { useState } from 'react';
import { 
  Car, 
  Zap, 
  Flame, 
  Utensils, 
  ShoppingBag, 
  Trash2, 
  Droplet, 
  Download, 
  CheckCircle2, 
  Info,
  TrendingDown,
  Globe2,
  Smartphone,
  Laptop,
  Wifi,
  MapPin,
  Crosshair,
  Package,
  Layers,
  Shirt,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Wind,
  RefreshCw,
  ExternalLink,
  FileText,
  Building
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Cell
} from 'recharts';
import { FootprintInput, FootprintResult, DataProvenance, PersonaType } from '../../types';
import { 
  calculateCarbonFootprint, 
  LOCAL_SUBREGION_BENCHMARKS 
} from '../../services/carbonCalculatorEngine';
import { INDIA_CITIES_DATABASE } from '../../services/indiaCitiesDatabase';
import { NDC_DATABASE, CountryNDC } from '../../services/ndcDatabase';
import { StorageService } from '../../services/storageService';
import { GovernmentGazetteSyncService, GovernmentGazetteClaim } from '../../services/governmentGazetteSync';

interface FootprintCalculatorModuleProps {
  activePersona: PersonaType;
  onInspectProvenance: (prov: DataProvenance) => void;
  onNavigateToPlanner: () => void;
}

export const FootprintCalculatorModule: React.FC<FootprintCalculatorModuleProps> = ({
  activePersona,
  onInspectProvenance,
  onNavigateToPlanner
}) => {
  const isBusiness = activePersona === 'business' || activePersona === 'school' || activePersona === 'ngo';

  // Active Country Code (Default: 'IN' India, can toggle to US, EU, UK, JP, BR, AU)
  const [selectedCountry, setSelectedCountry] = useState<'IN' | 'US' | 'EU' | 'UK' | 'JP' | 'BR' | 'AU'>('IN');
  const [activeTabSection, setActiveTabSection] = useState<'elementary' | 'ndc' | 'devices'>('elementary');

  // Accordion toggle states
  const [expandAppliances, setExpandAppliances] = useState<boolean>(true);
  const [expandCooking, setExpandCooking] = useState<boolean>(true);
  const [expandPlastics, setExpandPlastics] = useState<boolean>(true);
  const [expandNdcDossier, setExpandNdcDossier] = useState<boolean>(false);
  const [expandGovTracker, setExpandGovTracker] = useState<boolean>(true);

  // Live Government Gazette Sync State
  const [isSyncingGov, setIsSyncingGov] = useState<boolean>(false);
  const [govClaims, setGovClaims] = useState<GovernmentGazetteClaim[]>(() => GovernmentGazetteSyncService.getClaims());
  const [lastGovSync, setLastGovSync] = useState<string>(() => GovernmentGazetteSyncService.getLastSyncTimestamp());

  const handleTriggerGovSync = async () => {
    setIsSyncingGov(true);
    try {
      const res = await GovernmentGazetteSyncService.triggerLiveSync();
      setGovClaims(GovernmentGazetteSyncService.getClaims());
      setLastGovSync(`${res.updatedTimestamp} (Live Official 2026 Gazette Handshake)`);
      setSuccessToast(`Synchronized with official portals (${res.syncedPortals.length} registries verified for 2026)!`);
      setTimeout(() => setSuccessToast(null), 3500);
    } finally {
      setIsSyncingGov(false);
    }
  };

  // Calculator input state with spatial, device, appliance, cooking & plastic decomposition
  const [inputs, setInputs] = useState<FootprintInput>({
    countryCode: 'IN',
    auditMode: 'personal',
    carKmPerWeek: 110,
    carFuelType: 'petrol',
    publicTransitKmPerWeek: 45,
    flightsShortHaulPerYear: 2,
    flightsLongHaulPerYear: 0,
    electricityKwhPerMonth: 220,
    cookingGasCylindersOrKgPerMonth: 1,
    gridRegion: 'India_National',
    dietType: 'medium_meat',
    localFoodPercentage: 45,
    wasteBagsPerWeek: 2,
    recyclingRate: 40,
    shoppingExpenditureLevel: 'moderate',
    waterLitresPerDay: 135,
    subRegion: 'in-dl-delhi',
    exactCoordinates: { latitude: 28.6139, longitude: 77.2090, accuracyMeters: 15 },
    
    // Elementary Appliance Electricity Disaggregation
    applianceElectricity: {
      airConditioning: {
        count: 1,
        tons: 1.5,
        hoursPerDaySummer: 7,
        monthsPerYear: 5,
        starRating: 3
      },
      waterGeyser: {
        type: 'electric_storage',
        minutesPerDay: 25
      },
      refrigerator: {
        type: 'double_door_frost_free'
      },
      fansAndLighting: {
        ceilingFanType: 'standard_induction_75w',
        ledLightingRatioPercent: 70
      }
    },

    // Cooking Fuel Suitability (India LPG cylinders vs PNG vs Induction)
    cookingFuelSuitability: {
      fuelMode: 'lpg_14kg_cylinder',
      lpgCylinderDaysDuration: 42,
      pngScmPerMonth: 18
    },

    // Granular Shopping, Fashion & Plastics Decomposition
    shoppingPlasticsGranular: {
      frequency: 'biweekly',
      fastFashionGarmentsPerYear: 12,
      electronicsGadgetsPerYear: 2,
      petBottlesWeekly: 4,          // Code #1 PET
      hdpeBottlesMonthly: 2,        // Code #2 HDPE
      ldpeBagsWeekly: 6,            // Code #4 LDPE carry bags
      ppTakeawayContainersWeekly: 3,// Code #5 PP
      mlpSnackPacketsWeekly: 8      // Code #7 Multi-layer packets
    },

    // Digital Device & Cloud Telemetry
    deviceUsage: {
      smartphoneHoursPerDay: 4.5,
      laptopPcHoursPerDay: 7.0,
      tvStreamingHoursPerDay: 2.0,
      dailyDataStreamingGb: 10.0,
      standbyDevicesCount: 5
    }
  });

  const [geoStatus, setGeoStatus] = useState<string | null>('Pre-configured to New Delhi, India');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Switch Country Handler
  const handleCountryChange = (countryCode: 'IN' | 'US' | 'EU' | 'UK' | 'JP' | 'BR' | 'AU') => {
    setSelectedCountry(countryCode);
    const ndc = NDC_DATABASE[countryCode];
    const defaultSub = ndc.subRegions[0]?.id || 'in-dl-delhi';
    
    // Adapt default fuel mode based on country convention
    let defaultFuelMode: 'lpg_14kg_cylinder' | 'png_piped_gas' | 'electric_induction' | 'lpg_19kg_commercial' = 'lpg_14kg_cylinder';
    if (countryCode === 'US' || countryCode === 'EU' || countryCode === 'UK') {
      defaultFuelMode = 'png_piped_gas';
    } else if (countryCode === 'JP') {
      defaultFuelMode = 'electric_induction';
    }

    setInputs(prev => ({
      ...prev,
      countryCode,
      subRegion: defaultSub,
      cookingFuelSuitability: {
        ...prev.cookingFuelSuitability!,
        fuelMode: defaultFuelMode
      }
    }));

    setGeoStatus(`Active Country switched to ${ndc.flagEmoji} ${ndc.name}`);
  };

  // GPS Auto-Detection handler with smart India city snapping
  const handleDetectGPS = () => {
    if ('geolocation' in navigator) {
      setGeoStatus('Querying satellite GPS sensor...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(4));
          const lon = Number(pos.coords.longitude.toFixed(4));
          const acc = Math.round(pos.coords.accuracy);

          // Find nearest Indian urban/state center
          let nearest = INDIA_CITIES_DATABASE[0];
          let minDist = Infinity;
          for (const city of INDIA_CITIES_DATABASE) {
            const dLat = city.lat - lat;
            const dLon = city.lon - lon;
            const dist = Math.sqrt(dLat * dLat + dLon * dLon);
            if (dist < minDist) {
              minDist = dist;
              nearest = city;
            }
          }

          setSelectedCountry('IN');
          setInputs(prev => ({
            ...prev,
            countryCode: 'IN',
            exactCoordinates: { latitude: lat, longitude: lon, accuracyMeters: acc },
            subRegion: nearest.id
          }));
          setGeoStatus(`GPS Locked: (${lat}, ${lon}) ±${acc}m · Nearest Hub: ${nearest.name}, ${nearest.stateOrUT}`);
        },
        () => {
          setGeoStatus('GPS sensor unavailable. Using selected regional sub-district.');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setGeoStatus('Browser geolocation unavailable. Please select sub-region from list.');
    }
  };

  // Compute live calculation
  const result: FootprintResult = calculateCarbonFootprint(inputs);
  const activeCountryNDC: CountryNDC = NDC_DATABASE[selectedCountry] || NDC_DATABASE['IN'];
  const activeSubRegion = inputs.subRegion ? LOCAL_SUBREGION_BENCHMARKS[inputs.subRegion] : null;

  // Benchmark comparison chart data
  const benchmarkData = [
    { name: 'Your Calculated Total', tonnes: result.totalCarbonTonnes, fill: '#10b981' },
    ...(result.benchmarkComparison.localDistrictBenchmark ? [
      { name: `${inputs.subRegion ? inputs.subRegion.split('-')[2]?.toUpperCase() || 'Local' : 'District'} Baseline`, tonnes: result.benchmarkComparison.localDistrictBenchmark, fill: '#8b5cf6' }
    ] : []),
    { name: `${activeCountryNDC.name} National Avg`, tonnes: result.benchmarkComparison.countryBenchmark, fill: '#06b6d4' },
    { name: 'Global Average', tonnes: result.benchmarkComparison.globalAverage, fill: '#f59e0b' },
    { name: 'Paris 2030 (1.5°C Limit)', tonnes: result.benchmarkComparison.parisTarget2030, fill: '#34d399' }
  ];

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ECOGENESIS DETAILED ELEMENTARY ENVIRONMENTAL AUDIT REPORT\n" + 
      `"Country",${activeCountryNDC.name} (${activeCountryNDC.code})\n` +
      `"Location",${inputs.exactCoordinates ? `"${inputs.exactCoordinates.latitude}, ${inputs.exactCoordinates.longitude}"` : 'Regional'}\n` +
      `"Sub-Region / District",${inputs.subRegion || inputs.gridRegion}\n` +
      `"National Per-Capita Baseline",${activeCountryNDC.nationalPerCapitaBaseline} t CO2e\n` +
      `"2030 NDC Target",${activeCountryNDC.emissionsReductionTarget}\n\n` +
      "Category,Tonnes CO2e\n" + 
      Object.entries(result.categoryBreakdown)
        .filter(([_, val]) => typeof val === 'number' && val > 0)
        .map(([key, val]) => `"${key}",${val}`).join("\n") + 
      `\n"Total Annual Footprint",${result.totalCarbonTonnes}` +
      `\n"Benchmark Comparison",${result.benchmarkComparison.percentDiffVsBenchmark}%` +
      `\n"Data Provenance",${result.provenance.provider} (${result.provenance.datasetId})`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ecogenesis_audit_${selectedCountry}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessToast("Elementary environmental audit report exported as CSV!");
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleAddGoalFromOpportunity = (actionTitle: string) => {
    const goals = StorageService.getGoals();
    const newGoal = {
      id: `goal-${Date.now()}`,
      title: actionTitle,
      category: 'energy' as const,
      targetValue: 25,
      currentValue: 0,
      unit: '% reduction',
      deadline: '2026-12-31',
      completed: false
    };
    StorageService.saveGoals([newGoal, ...goals]);
    setSuccessToast(`"${actionTitle}" added to your Sustainable Living Planner!`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-950 border border-emerald-500 text-emerald-200 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-mono">{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 mb-1">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>ELEMENTARY USABILITY & PARIS NATIONALLY DETERMINED CONTRIBUTIONS</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-display">
            {inputs.auditMode === 'enterprise_scopes' ? 'Enterprise Scope 1, 2, 3 Corporate Environmental Audit' : 'Personal & Household Environmental Footprint Calculator'}
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            Granular appliance electricity, 14.2kg LPG cylinder suitability, polymer plastics decomposition, and official NDC commitments.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onInspectProvenance(result.provenance)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#061810] border border-emerald-500/40 text-emerald-300 text-xs font-mono hover:bg-emerald-900/40 transition-colors cursor-pointer"
          >
            <Info className="w-4 h-4 text-emerald-400" />
            <span>Methodology & Provenance</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-950 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Audit</span>
          </button>
        </div>
      </div>

      {/* COUNTRY SWITCHER PILL BAR */}
      <div className="glass-panel rounded-2xl p-4 border border-emerald-500/40 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-mono text-gray-300 flex items-center space-x-1.5 font-bold">
            <Globe2 className="w-4 h-4 text-emerald-400" />
            <span>SELECT COUNTRY & NATIONALLY DETERMINED CONTRIBUTION (NDC) JURISDICTION:</span>
          </span>
          <span className="text-[11px] font-mono text-emerald-400">
            Current: {activeCountryNDC.flagEmoji} {activeCountryNDC.name} ({activeCountryNDC.currencyCode})
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {(['IN', 'US', 'EU', 'UK', 'JP', 'BR', 'AU'] as const).map(code => {
            const country = NDC_DATABASE[code];
            const isSelected = selectedCountry === code;
            return (
              <button
                key={code}
                onClick={() => handleCountryChange(code)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-emerald-600 text-white border-2 border-emerald-300 shadow-lg shadow-emerald-900/50 scale-105' 
                    : 'bg-[#030c08] border border-emerald-900/60 text-gray-300 hover:text-emerald-300 hover:border-emerald-700'
                }`}
              >
                <span className="text-base">{country.flagEmoji}</span>
                <span className="font-semibold">{country.name}</span>
                <span className="text-[10px] opacity-75">({country.nationalPerCapitaBaseline}t)</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* NDC INTELLIGENCE DOSSIER CARD */}
      <div className="glass-panel rounded-2xl p-5 border border-emerald-500/40 space-y-4 bg-gradient-to-r from-[#030c08] to-[#041a10]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-950 pb-3">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{activeCountryNDC.flagEmoji}</span>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white font-display">
                  {activeCountryNDC.name} · Paris Agreement NDC Commitment Dossier
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  activeCountryNDC.climateActionTrackerRating === 'Almost Sufficient' 
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                    : 'bg-amber-950 text-amber-300 border-amber-600'
                }`}>
                  CAT: {activeCountryNDC.climateActionTrackerRating}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono">
                Ratified: {activeCountryNDC.parisRatificationDate} · Net-Zero Statutory Year: <strong>{activeCountryNDC.netZeroTargetYear}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => setExpandNdcDossier(!expandNdcDossier)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#061810] border border-emerald-800 text-emerald-300 text-xs font-mono hover:bg-emerald-900/40 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>{expandNdcDossier ? 'Hide Full Policy Dossier' : 'Inspect NDC Policies & Sinks'}</span>
            {expandNdcDossier ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Core NDC Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-[#030c08] p-3 rounded-lg border border-emerald-950 space-y-1">
            <span className="text-gray-400 text-[10px] block">2030 EMISSIONS TARGET:</span>
            <span className="text-emerald-400 font-bold text-xs leading-relaxed block">
              {activeCountryNDC.emissionsReductionTarget}
            </span>
          </div>

          <div className="bg-[#030c08] p-3 rounded-lg border border-emerald-950 space-y-1">
            <span className="text-gray-400 text-[10px] block">RENEWABLE POWER GOAL:</span>
            <span className="text-cyan-400 font-bold text-xs leading-relaxed block">
              {activeCountryNDC.renewableEnergyTarget}
            </span>
          </div>

          <div className="bg-[#030c08] p-3 rounded-lg border border-emerald-950 space-y-1">
            <span className="text-gray-400 text-[10px] block">CARBON SINK / NATURE GOAL:</span>
            <span className="text-emerald-300 font-bold text-xs leading-relaxed block">
              {activeCountryNDC.carbonSinkTarget}
            </span>
          </div>

          <div className="bg-[#030c08] p-3 rounded-lg border border-emerald-950 space-y-1">
            <span className="text-gray-400 text-[10px] block">DOMESTIC COOKING / ENERGY CONTEXT:</span>
            <span className="text-amber-300 font-medium text-[11px] leading-relaxed block">
              {activeCountryNDC.typicalCookingFuel}
            </span>
          </div>
        </div>

        {/* Expanded Policy Pillars */}
        {expandNdcDossier && (
          <div className="pt-3 border-t border-emerald-950/80 space-y-3">
            <h4 className="text-xs font-bold text-emerald-300 font-mono uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Key Statutory Policy Pillars ({activeCountryNDC.name}):</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeCountryNDC.keyPolicyPillars.map((pillar, idx) => (
                <div key={idx} className="bg-[#020905] p-3 rounded-xl border border-emerald-900/50 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-display">{pillar.name}</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      Pillar #{idx + 1}
                    </span>
                  </div>
                  <p className="text-gray-300 text-[11px] leading-relaxed">{pillar.description}</p>
                  <p className="text-cyan-300 font-mono text-[10px] pt-1">Target Impact: {pillar.targetImpact}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* LIVE GOVERNMENT GAZETTE & OFFICIAL PORTAL SYNCHRONIZATION FEED */}
      <div className="glass-panel rounded-2xl p-5 border border-cyan-500/40 space-y-4 bg-gradient-to-r from-[#030e0c] via-[#041611] to-[#030c08]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-950 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white font-display">
                  Official Government Gazette & Policy Claim Ingestion Feed
                </h3>
                <span className="flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>GOV_PORTALS_ACTIVE</span>
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono">
                Continuous synchronization with <strong>PIB India (pib.gov.in)</strong>, <strong>US Federal Register</strong>, state portals, and <strong>EU Commission Press Corner</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            {/* Live Sync Trigger Button */}
            <button
              onClick={handleTriggerGovSync}
              disabled={isSyncingGov}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                isSyncingGov
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500 animate-pulse'
                  : 'bg-[#031c14] hover:bg-[#072a1e] text-cyan-300 border-cyan-700/60 shadow-md shadow-cyan-950'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncingGov ? 'animate-spin' : ''}`} />
              <span>{isSyncingGov ? 'Polling Portals...' : 'Sync Official Portals'}</span>
            </button>

            <button
              onClick={() => setExpandGovTracker(!expandGovTracker)}
              className="p-1.5 rounded-lg bg-[#061810] border border-emerald-800 text-emerald-300 hover:bg-emerald-900/40 transition-colors cursor-pointer"
            >
              {expandGovTracker ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Sync Status Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-gray-400 bg-[#020a07] px-3.5 py-2 rounded-xl border border-emerald-950 gap-2">
          <span className="flex items-center space-x-1.5">
            <span className="text-emerald-400 font-bold">● Active Automated Gazette Watch:</span>
            <span>PIB Releases (MoPNG, MNRE, MoEFCC) · CEA CO2 Database · US EPA eGRID · CARB Executive Orders · EC Directives</span>
          </span>
          <span className="text-cyan-300 whitespace-nowrap">Last Synced: {lastGovSync}</span>
        </div>

        {/* Official Claims Grid for Selected Country */}
        {expandGovTracker && (
          <div className="space-y-3 pt-1">
            {govClaims.filter(c => c.countryCode === selectedCountry).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {govClaims.filter(c => c.countryCode === selectedCountry).map((claim) => (
                  <div key={claim.id} className="bg-[#020b07] p-4 rounded-xl border border-cyan-950 hover:border-cyan-700/60 transition-all space-y-2.5 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 font-bold">
                          {claim.officialReferenceId}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">
                          {claim.publishedDate}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-emerald-400 block font-semibold">
                          {claim.issuingBody}
                        </span>
                        <h4 className="text-xs font-bold text-white font-display leading-snug">
                          {claim.title}
                        </h4>
                        <p className="text-[11px] text-gray-300 leading-relaxed font-sans">
                          {claim.summary}
                        </p>
                      </div>

                      {/* Verified Parameter Changes */}
                      {claim.affectedParameters.length > 0 && (
                        <div className="bg-[#010804] p-2.5 rounded-lg border border-emerald-950 space-y-1 text-[11px] font-mono">
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Impact on Calculation Parameters:</span>
                          {claim.affectedParameters.map((param, pIdx) => (
                            <div key={pIdx} className="flex justify-between items-center text-xs">
                              <span className="text-gray-300">{param.parameter}:</span>
                              <span className="text-emerald-400 font-bold">
                                <span className="line-through text-gray-500 font-normal mr-1">{param.previousValue}</span>
                                ➔ {param.updatedValue} <span className="text-[10px] text-gray-400">{param.unit}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Source Links & Provenance */}
                    <div className="flex items-center justify-between pt-2 border-t border-emerald-950/70 text-[10px] font-mono">
                      <a
                        href={claim.officialSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 transition-colors underline cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Official Gazette URL</span>
                      </a>

                      <button
                        onClick={() => onInspectProvenance(GovernmentGazetteSyncService.getProvenance(claim))}
                        className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Inspect Verification Provenance</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#020b07] border border-emerald-950 text-center space-y-1 text-xs font-mono text-gray-400">
                <span>No pending gazette revisions currently recorded for {activeCountryNDC.name}.</span>
                <span className="block text-[11px] text-cyan-400">Background automated sidecar polls national registry daily.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SPATIAL KNOWLEDGE & LOCATION SENSOR BANNER */}
      <div className="glass-panel rounded-2xl p-6 border border-emerald-500/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-950 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-500/50 text-emerald-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Spatial Knowledge & Local Municipal District</h3>
              <p className="text-xs text-gray-400 font-mono">Calibrates calculations against your exact municipal grid & per-capita baseline</p>
            </div>
          </div>

          {selectedCountry === 'IN' && (
            <button
              onClick={handleDetectGPS}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#030c08] border border-emerald-400/60 hover:bg-emerald-950 text-emerald-300 text-xs font-mono transition-all cursor-pointer shadow-inner"
            >
              <Crosshair className="w-4 h-4 text-emerald-400 animate-spin-slow" />
              <span>Auto-Detect Live GPS</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
          
          {/* Sub-region dropdown */}
          <div className="space-y-1">
            <label className="text-gray-400 font-mono text-[11px] block">Specific Sub-Region / Municipal District:</label>
            <select
              value={inputs.subRegion}
              onChange={(e) => setInputs({ ...inputs, subRegion: e.target.value })}
              className="w-full bg-[#030c08] border border-emerald-800/80 rounded-lg px-3 py-2 text-emerald-300 font-medium focus:outline-none"
            >
              {selectedCountry === 'IN' ? (
                <>
                  <optgroup label="All 28 State Capitals (India)">
                    {INDIA_CITIES_DATABASE.filter(c => c.type === 'State Capital').map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}, {c.stateOrUT} (Per-Capita: {c.perCapitaTonnes}t · Grid: {c.gridCarbonIntensity} kg/kWh)
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="All 8 Union Territory Capitals (India)">
                    {INDIA_CITIES_DATABASE.filter(c => c.type === 'UT Capital').map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}, {c.stateOrUT} (Per-Capita: {c.perCapitaTonnes}t · Grid: {c.gridCarbonIntensity} kg/kWh)
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Tier 2 Major Urban Centers (India)">
                    {INDIA_CITIES_DATABASE.filter(c => c.type === 'Tier 2').map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}, {c.stateOrUT} (Per-Capita: {c.perCapitaTonnes}t · Grid: {c.gridCarbonIntensity} kg/kWh)
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Tier 3 Cities & Ecological Hubs (India)">
                    {INDIA_CITIES_DATABASE.filter(c => c.type === 'Tier 3').map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}, {c.stateOrUT} (Per-Capita: {c.perCapitaTonnes}t · Grid: {c.gridCarbonIntensity} kg/kWh)
                      </option>
                    ))}
                  </optgroup>
                </>
              ) : (
                <optgroup label={`${activeCountryNDC.name} Sub-Regional Grids`}>
                  {activeCountryNDC.subRegions.map(sr => (
                    <option key={sr.id} value={sr.id}>
                      {sr.name} (Per-Capita: {sr.perCapitaTonnes}t · Grid: {sr.gridCarbonIntensity} kg/kWh)
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Local Grid Carbon Factor */}
          <div className="bg-[#030c08] p-3 rounded-lg border border-emerald-950 space-y-0.5 font-mono">
            <span className="text-gray-400 text-[10px] block">SUB-REGIONAL GRID CARBON INTENSITY:</span>
            <span className="text-emerald-400 font-bold text-sm">
              {activeSubRegion ? `${activeSubRegion.gridCarbonIntensity} kg CO2e / kWh` : `${activeCountryNDC.nationalGridCarbonIntensity} kg/kWh`}
            </span>
            <span className="text-[10px] text-gray-400 block truncate">{activeSubRegion?.primaryEnergySource || activeCountryNDC.name}</span>
          </div>

          {/* Exact Coordinates & Accuracy */}
          <div className="bg-[#030c08] p-3 rounded-lg border border-emerald-950 space-y-0.5 font-mono">
            <span className="text-gray-400 text-[10px] block">MUNICIPAL SPATIAL TELEMETRY:</span>
            <span className="text-cyan-300 font-bold text-xs truncate block">{geoStatus}</span>
            <span className="text-[10px] text-gray-400 block">
              Jurisdiction Baseline: {activeSubRegion?.perCapitaTonnes || activeCountryNDC.nationalPerCapitaBaseline} t CO2e/capita
            </span>
          </div>

        </div>
      </div>

      {/* Main Grid: Elementary Inputs vs Visual Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Elementary Inputs */}
        <div className="lg:col-span-7 glass-panel rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-emerald-950 pb-3">
            <div>
              <h3 className="text-base font-bold text-white font-display">Elementary Usability Disaggregation</h3>
              <p className="text-[11px] text-gray-400 font-mono">Real-world appliance power draw, cooking gas duration & plastic polymer codes</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              Deterministic Physics
            </span>
          </div>

          <div className="space-y-6 text-xs font-sans">
            
            {/* AUDIT MODE SELECTOR: Personal Lifestyle vs Enterprise Scopes */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#020905] p-2 rounded-xl border border-emerald-900/60 gap-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setInputs(prev => ({ 
                    ...prev, 
                    auditMode: 'personal',
                    scope1DirectFuelLitres: undefined,
                    scope2FacilityKwh: undefined,
                    scope3SupplyChainTonnes: undefined 
                  }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    inputs.auditMode !== 'enterprise_scopes'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950 scale-102'
                      : 'text-gray-400 hover:text-emerald-300'
                  }`}
                >
                  Personal & Household Lifestyle Footprint
                </button>

                <button
                  onClick={() => setInputs(prev => ({ 
                    ...prev, 
                    auditMode: 'enterprise_scopes',
                    scope1DirectFuelLitres: prev.scope1DirectFuelLitres || 1200,
                    scope2FacilityKwh: prev.scope2FacilityKwh || 18000,
                    scope3SupplyChainTonnes: prev.scope3SupplyChainTonnes || 24
                  }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    inputs.auditMode === 'enterprise_scopes'
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950 scale-102'
                      : 'text-gray-400 hover:text-cyan-300'
                  }`}
                >
                  Enterprise Scope 1, 2, 3 Audit
                </button>
              </div>

              <span className="text-[10px] font-mono text-emerald-400">
                {inputs.auditMode === 'enterprise_scopes' ? 'GHG Protocol Corporate Standard' : 'IPCC Individual Lifestyle Model (Active Live Calculation)'}
              </span>
            </div>

            {inputs.auditMode === 'enterprise_scopes' ? (
              <div className="space-y-4 bg-[#04110a] p-4 rounded-xl border border-cyan-800/60">
                <div className="flex items-center justify-between border-b border-emerald-950 pb-2">
                  <span className="font-bold text-cyan-400 font-display text-sm">
                    Corporate Greenhouse Gas Protocol (Scope 1, 2, 3)
                  </span>
                  <span className="text-[10px] font-mono text-cyan-300">ISO 14064 Standard</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-gray-300 mb-1">
                      <span>Scope 1 Direct Stationary Combustion (Diesel/Fuel Litres):</span>
                      <span className="text-cyan-300 font-mono font-bold">{inputs.scope1DirectFuelLitres || 1200} Litres/yr</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20000"
                      step="100"
                      value={inputs.scope1DirectFuelLitres || 1200}
                      onChange={(e) => setInputs({ ...inputs, scope1DirectFuelLitres: Number(e.target.value) })}
                      className="w-full accent-cyan-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-gray-300 mb-1">
                      <span>Scope 2 Purchased Facility Electricity (kWh/yr):</span>
                      <span className="text-emerald-300 font-mono font-bold">{inputs.scope2FacilityKwh || 18000} kWh/yr</span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="150000"
                      step="1000"
                      value={inputs.scope2FacilityKwh || 18000}
                      onChange={(e) => setInputs({ ...inputs, scope2FacilityKwh: Number(e.target.value) })}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-gray-300 mb-1">
                      <span>Scope 3 Value Chain & Procurement (Tonnes CO2e):</span>
                      <span className="text-amber-300 font-mono font-bold">{inputs.scope3SupplyChainTonnes || 24} Tonnes/yr</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      step="5"
                      value={inputs.scope3SupplyChainTonnes || 24}
                      onChange={(e) => setInputs({ ...inputs, scope3SupplyChainTonnes: Number(e.target.value) })}
                      className="w-full accent-amber-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
            {/* 1. APPLIANCE ELECTRICITY DISAGGREGATION */}
            <div className="bg-[#04110a] rounded-xl border border-emerald-800/60 overflow-hidden">
              <button
                onClick={() => setExpandAppliances(!expandAppliances)}
                className="w-full flex items-center justify-between p-4 bg-[#030c08] border-b border-emerald-950 text-left cursor-pointer hover:bg-emerald-950/40 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-white font-display text-sm">
                    1. Appliance Electricity Disaggregation (What electricity is used for)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-mono text-cyan-300">
                    {result.granularAuditDetails?.applianceElectricity?.totalDisaggregatedKwhPerMonth || 220} kWh/mo
                  </span>
                  {expandAppliances ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              {expandAppliances && (
                <div className="p-4 space-y-4">
                  {/* Air Conditioning Breakdown */}
                  <div className="bg-[#020905] p-3 rounded-lg border border-emerald-950 space-y-2">
                    <div className="flex justify-between items-center text-gray-200">
                      <span className="font-semibold text-cyan-400 flex items-center space-x-1.5">
                        <Wind className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Air Conditioning (Tonnage, Star Rating & Daily Hours):</span>
                      </span>
                      <span className="text-cyan-300 font-mono font-bold">
                        ~{result.granularAuditDetails?.applianceElectricity?.acKwhPerMonth || 95} kWh/mo
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
                      <div>
                        <span className="text-gray-400 text-[10px] block">AC Units:</span>
                        <select
                          value={inputs.applianceElectricity?.airConditioning.count}
                          onChange={(e) => setInputs({
                            ...inputs,
                            applianceElectricity: {
                              ...inputs.applianceElectricity!,
                              airConditioning: { ...inputs.applianceElectricity!.airConditioning, count: Number(e.target.value) }
                            }
                          })}
                          className="w-full bg-[#061810] border border-emerald-900 rounded px-2 py-1 text-emerald-300 text-xs"
                        >
                          <option value="0">0 (No AC)</option>
                          <option value="1">1 Unit</option>
                          <option value="2">2 Units</option>
                          <option value="3">3 Units</option>
                        </select>
                      </div>

                      <div>
                        <span className="text-gray-400 text-[10px] block">Capacity:</span>
                        <select
                          value={inputs.applianceElectricity?.airConditioning.tons}
                          onChange={(e) => setInputs({
                            ...inputs,
                            applianceElectricity: {
                              ...inputs.applianceElectricity!,
                              airConditioning: { ...inputs.applianceElectricity!.airConditioning, tons: Number(e.target.value) as any }
                            }
                          })}
                          className="w-full bg-[#061810] border border-emerald-900 rounded px-2 py-1 text-emerald-300 text-xs"
                        >
                          <option value="1.0">1.0 Ton (1 kW)</option>
                          <option value="1.5">1.5 Ton (1.5 kW)</option>
                          <option value="2.0">2.0 Ton (2.0 kW)</option>
                        </select>
                      </div>

                      <div>
                        <span className="text-gray-400 text-[10px] block">BEE Star Rating:</span>
                        <select
                          value={inputs.applianceElectricity?.airConditioning.starRating}
                          onChange={(e) => setInputs({
                            ...inputs,
                            applianceElectricity: {
                              ...inputs.applianceElectricity!,
                              airConditioning: { ...inputs.applianceElectricity!.airConditioning, starRating: Number(e.target.value) as any }
                            }
                          })}
                          className="w-full bg-[#061810] border border-emerald-900 rounded px-2 py-1 text-emerald-300 text-xs"
                        >
                          <option value="1">1-Star (+25% power)</option>
                          <option value="3">3-Star (Standard)</option>
                          <option value="5">5-Star Inverter (-28%)</option>
                        </select>
                      </div>

                      <div>
                        <span className="text-gray-400 text-[10px] block">Summer Hours/Day:</span>
                        <input
                          type="number"
                          min="0"
                          max="24"
                          value={inputs.applianceElectricity?.airConditioning.hoursPerDaySummer}
                          onChange={(e) => setInputs({
                            ...inputs,
                            applianceElectricity: {
                              ...inputs.applianceElectricity!,
                              airConditioning: { ...inputs.applianceElectricity!.airConditioning, hoursPerDaySummer: Math.max(0, Number(e.target.value)) }
                            }
                          })}
                          className="w-full bg-[#061810] border border-emerald-900 rounded px-2 py-1 text-gray-200 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Water Geyser & Refrigerator */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-[#020905] p-3 rounded-lg border border-emerald-950 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 font-semibold flex items-center space-x-1">
                          <Droplet className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Water Geyser / Heater:</span>
                        </span>
                        <span className="text-cyan-300 font-mono text-[11px]">
                          ~{result.granularAuditDetails?.applianceElectricity?.geyserKwhPerMonth || 35} kWh/mo
                        </span>
                      </div>
                      <select
                        value={inputs.applianceElectricity?.waterGeyser.type}
                        onChange={(e) => setInputs({
                          ...inputs,
                          applianceElectricity: {
                            ...inputs.applianceElectricity!,
                            waterGeyser: { ...inputs.applianceElectricity!.waterGeyser, type: e.target.value as any }
                          }
                        })}
                        className="w-full bg-[#061810] border border-emerald-900 rounded px-2 py-1 text-emerald-300 text-xs"
                      >
                        <option value="electric_storage">Electric Storage Geyser (2.0 kW)</option>
                        <option value="instant_electric">Instant Electric Geyser (3.0 kW)</option>
                        <option value="solar_thermal">Rooftop Solar Thermal Water Heater (0 kW)</option>
                      </select>
                    </div>

                    <div className="bg-[#020905] p-3 rounded-lg border border-emerald-950 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 font-semibold flex items-center space-x-1">
                          <Zap className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Refrigerator Efficiency:</span>
                        </span>
                        <span className="text-emerald-300 font-mono text-[11px]">
                          ~{result.granularAuditDetails?.applianceElectricity?.refrigeratorKwhPerMonth || 28} kWh/mo
                        </span>
                      </div>
                      <select
                        value={inputs.applianceElectricity?.refrigerator.type}
                        onChange={(e) => setInputs({
                          ...inputs,
                          applianceElectricity: {
                            ...inputs.applianceElectricity!,
                            refrigerator: { ...inputs.applianceElectricity!.refrigerator, type: e.target.value as any }
                          }
                        })}
                        className="w-full bg-[#061810] border border-emerald-900 rounded px-2 py-1 text-emerald-300 text-xs"
                      >
                        <option value="single_door_5star">Single Door 5-Star (~180 kWh/yr)</option>
                        <option value="double_door_frost_free">Frost-Free Double Door (~330 kWh/yr)</option>
                        <option value="older_inefficient">Older Inefficient Unit (~550 kWh/yr)</option>
                      </select>
                    </div>
                  </div>

                  {/* Ceiling Fans & LED Lighting */}
                  <div className="bg-[#020905] p-3 rounded-lg border border-emerald-950 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 font-semibold">Ceiling Fans (Standard 75W vs BLDC 28W) & LEDs:</span>
                      <span className="text-emerald-300 font-mono text-[11px]">
                        ~{result.granularAuditDetails?.applianceElectricity?.fansAndLightingKwhPerMonth || 45} kWh/mo
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={inputs.applianceElectricity?.fansAndLighting.ceilingFanType}
                        onChange={(e) => setInputs({
                          ...inputs,
                          applianceElectricity: {
                            ...inputs.applianceElectricity!,
                            fansAndLighting: { ...inputs.applianceElectricity!.fansAndLighting, ceilingFanType: e.target.value as any }
                          }
                        })}
                        className="w-full bg-[#061810] border border-emerald-900 rounded px-2 py-1 text-emerald-300 text-xs"
                      >
                        <option value="standard_induction_75w">Standard Induction Fans (75W each)</option>
                        <option value="bldc_energy_saver_28w">BLDC Energy Saver Fans (28W each - 62% cut)</option>
                      </select>

                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-[10px] whitespace-nowrap">LED Ratio:</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="10"
                          value={inputs.applianceElectricity?.fansAndLighting.ledLightingRatioPercent || 70}
                          onChange={(e) => setInputs({
                            ...inputs,
                            applianceElectricity: {
                              ...inputs.applianceElectricity!,
                              fansAndLighting: { ...inputs.applianceElectricity!.fansAndLighting, ledLightingRatioPercent: Number(e.target.value) }
                            }
                          })}
                          className="w-full accent-emerald-500"
                        />
                        <span className="text-emerald-400 font-mono text-[10px] w-8">
                          {inputs.applianceElectricity?.fansAndLighting.ledLightingRatioPercent}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. COOKING FUEL SUITABILITY (INDIA LPG CYLINDERS VS PNG VS INDUCTION) */}
            <div className="bg-[#04110a] rounded-xl border border-emerald-800/60 overflow-hidden">
              <button
                onClick={() => setExpandCooking(!expandCooking)}
                className="w-full flex items-center justify-between p-4 bg-[#030c08] border-b border-emerald-950 text-left cursor-pointer hover:bg-emerald-950/40 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-white font-display text-sm">
                    2. Cooking Fuel Suitability (14.2kg Domestic Cylinder vs PNG vs Induction)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-mono text-amber-300">
                    {result.granularAuditDetails?.cookingFuelSuitability?.cookingCarbonTonnes || 0.35} t CO2e/yr
                  </span>
                  {expandCooking ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              {expandCooking && (
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-gray-400 font-mono text-[11px] block">Primary Household Cooking Energy Source:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'lpg_14kg_cylinder', label: '14.2 kg LPG Cylinder', note: 'Standard Indian Home' },
                        { id: 'png_piped_gas', label: 'Piped Natural Gas (PNG)', note: 'City Gas Distribution' },
                        { id: 'electric_induction', label: 'Electric Induction', note: '84% Thermal Efficiency' },
                        { id: 'lpg_19kg_commercial', label: '19 kg Commercial LPG', note: 'Commercial/Hostel' }
                      ].map(mode => (
                        <button
                          key={mode.id}
                          onClick={() => setInputs({
                            ...inputs,
                            cookingFuelSuitability: { ...inputs.cookingFuelSuitability!, fuelMode: mode.id as any }
                          })}
                          className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                            inputs.cookingFuelSuitability?.fuelMode === mode.id
                              ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                              : 'bg-[#020905] border-emerald-950 text-gray-400 hover:text-gray-200'
                          }`}
                        >
                          <span className="font-bold text-xs block">{mode.label}</span>
                          <span className="text-[10px] text-gray-400 block">{mode.note}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {inputs.cookingFuelSuitability?.fuelMode === 'lpg_14kg_cylinder' && (
                    <div className="bg-[#020905] p-3 rounded-lg border border-amber-950/80 space-y-2">
                      <div className="flex justify-between text-gray-300">
                        <span>How many days does 1 cylinder (14.2 kg) last in your household?</span>
                        <span className="text-amber-400 font-mono font-bold">
                          {inputs.cookingFuelSuitability.lpgCylinderDaysDuration} Days / Cylinder
                        </span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="90"
                        step="2"
                        value={inputs.cookingFuelSuitability.lpgCylinderDaysDuration || 42}
                        onChange={(e) => setInputs({
                          ...inputs,
                          cookingFuelSuitability: { ...inputs.cookingFuelSuitability!, lpgCylinderDaysDuration: Number(e.target.value) }
                        })}
                        className="w-full accent-amber-500"
                      />
                      <div className="flex justify-between text-[11px] font-mono text-gray-400 pt-1">
                        <span>Annual Consumption: ~{result.granularAuditDetails?.cookingFuelSuitability?.annualLpgCylinders || 8.7} cylinders/yr</span>
                        <span className="text-amber-300">Emissions: ~{result.granularAuditDetails?.cookingFuelSuitability?.cookingCarbonTonnes} t CO2e/yr</span>
                      </div>
                    </div>
                  )}

                  {/* Clean Electric Induction Transition Comparison */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-[#03150d] to-[#082a1a] border border-emerald-500/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-300 flex items-center space-x-1 font-display">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Electric Induction Transition Physics</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-200 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700">
                        84% vs 40% Thermal Efficiency
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      Gas burners lose over 55-60% of heat into room air. Electric induction transfers heat directly to cookware. 
                      Transitioning requires only ~{result.granularAuditDetails?.cookingFuelSuitability?.inductionAnnualKwhNeeded || 750} kWh/yr of electricity.
                    </p>
                    <div className="flex justify-between items-center pt-1 font-mono text-[11px]">
                      <span className="text-emerald-400">
                        Potential Abatement: -{result.granularAuditDetails?.cookingFuelSuitability?.transitionSavingsTonnes || 0.18} t CO2e/yr
                      </span>
                      <span className="text-cyan-300 text-[10px]">
                        {result.granularAuditDetails?.cookingFuelSuitability?.costSavingsComparison}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. GRANULAR SHOPPING, FAST FASHION & PLASTIC POLYMERS */}
            <div className="bg-[#04110a] rounded-xl border border-emerald-800/60 overflow-hidden">
              <button
                onClick={() => setExpandPlastics(!expandPlastics)}
                className="w-full flex items-center justify-between p-4 bg-[#030c08] border-b border-emerald-950 text-left cursor-pointer hover:bg-emerald-950/40 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-4 h-4 text-purple-400" />
                  <span className="font-bold text-white font-display text-sm">
                    3. Shopping Habits & Plastic Polymer Decomposition (#1 to #7)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-mono text-purple-300">
                    {result.granularAuditDetails?.shoppingPlastics?.totalPlasticKgPerYear || 28} kg plastic/yr
                  </span>
                  {expandPlastics ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              {expandPlastics && (
                <div className="p-4 space-y-4">
                  {/* Shopping Frequency & Fast Fashion */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-[#020905] p-3 rounded-lg border border-emerald-950 space-y-1">
                      <span className="text-gray-400 text-[10px] block">Shopping Frequency:</span>
                      <select
                        value={inputs.shoppingPlasticsGranular?.frequency}
                        onChange={(e) => setInputs({
                          ...inputs,
                          shoppingPlasticsGranular: { ...inputs.shoppingPlasticsGranular!, frequency: e.target.value as any }
                        })}
                        className="w-full bg-[#061810] border border-emerald-900 rounded px-2 py-1 text-emerald-300 text-xs"
                      >
                        <option value="minimalist">Minimalist (Essentials only)</option>
                        <option value="monthly">Monthly Purchases</option>
                        <option value="biweekly">Bi-Weekly Shopping</option>
                        <option value="weekly">Weekly High-Volume</option>
                      </select>
                    </div>

                    <div className="bg-[#020905] p-3 rounded-lg border border-emerald-950 space-y-1">
                      <span className="text-gray-400 text-[10px] block">Fast Fashion Garments / Year:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={inputs.shoppingPlasticsGranular?.fastFashionGarmentsPerYear}
                        onChange={(e) => setInputs({
                          ...inputs,
                          shoppingPlasticsGranular: {
                            ...inputs.shoppingPlasticsGranular!,
                            fastFashionGarmentsPerYear: Math.max(0, Number(e.target.value))
                          }
                        })}
                        className="w-full bg-[#061810] border border-emerald-900 rounded px-2 py-1 text-gray-200 text-xs font-mono"
                      />
                      <span className="text-[9px] text-gray-400 block">~18.5 kg CO2e / garment</span>
                    </div>

                    <div className="bg-[#020905] p-3 rounded-lg border border-emerald-950 space-y-1">
                      <span className="text-gray-400 text-[10px] block">Electronics / Gadgets / Year:</span>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={inputs.shoppingPlasticsGranular?.electronicsGadgetsPerYear}
                        onChange={(e) => setInputs({
                          ...inputs,
                          shoppingPlasticsGranular: {
                            ...inputs.shoppingPlasticsGranular!,
                            electronicsGadgetsPerYear: Math.max(0, Number(e.target.value))
                          }
                        })}
                        className="w-full bg-[#061810] border border-emerald-900 rounded px-2 py-1 text-gray-200 text-xs font-mono"
                      />
                      <span className="text-[9px] text-gray-400 block">~75 kg CO2e / device</span>
                    </div>
                  </div>

                  {/* Specific Polymer Codes (#1, #2, #4, #5, #7) */}
                  <div className="bg-[#020905] p-3 rounded-lg border border-purple-950 space-y-2">
                    <div className="flex items-center justify-between border-b border-purple-950/60 pb-2">
                      <span className="font-semibold text-purple-300 flex items-center space-x-1.5 text-xs">
                        <Package className="w-3.5 h-3.5 text-purple-400" />
                        <span>Polymer Identification Resin Codes & Single-Use Items:</span>
                      </span>
                      <span className="text-[10px] font-mono text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                        {result.granularAuditDetails?.shoppingPlastics?.recyclableSharePercent || 48}% Recyclable Share
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                      {/* PET #1 */}
                      <div>
                        <div className="flex justify-between text-gray-300 mb-1">
                          <span>#1 PET Single-Use Water/Soda Bottles:</span>
                          <span className="text-emerald-300 font-mono font-bold">
                            {inputs.shoppingPlasticsGranular?.petBottlesWeekly} / week
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="25"
                          step="1"
                          value={inputs.shoppingPlasticsGranular?.petBottlesWeekly || 4}
                          onChange={(e) => setInputs({
                            ...inputs,
                            shoppingPlasticsGranular: {
                              ...inputs.shoppingPlasticsGranular!,
                              petBottlesWeekly: Number(e.target.value)
                            }
                          })}
                          className="w-full accent-emerald-500"
                        />
                      </div>

                      {/* HDPE #2 */}
                      <div>
                        <div className="flex justify-between text-gray-300 mb-1">
                          <span>#2 HDPE Detergent / Milk Bottles:</span>
                          <span className="text-cyan-300 font-mono font-bold">
                            {inputs.shoppingPlasticsGranular?.hdpeBottlesMonthly} / month
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="15"
                          step="1"
                          value={inputs.shoppingPlasticsGranular?.hdpeBottlesMonthly || 2}
                          onChange={(e) => setInputs({
                            ...inputs,
                            shoppingPlasticsGranular: {
                              ...inputs.shoppingPlasticsGranular!,
                              hdpeBottlesMonthly: Number(e.target.value)
                            }
                          })}
                          className="w-full accent-cyan-500"
                        />
                      </div>

                      {/* LDPE #4 */}
                      <div>
                        <div className="flex justify-between text-gray-300 mb-1">
                          <span>#4 LDPE Thin Grocery Carry Bags:</span>
                          <span className="text-amber-300 font-mono font-bold">
                            {inputs.shoppingPlasticsGranular?.ldpeBagsWeekly} / week
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="30"
                          step="1"
                          value={inputs.shoppingPlasticsGranular?.ldpeBagsWeekly || 6}
                          onChange={(e) => setInputs({
                            ...inputs,
                            shoppingPlasticsGranular: {
                              ...inputs.shoppingPlasticsGranular!,
                              ldpeBagsWeekly: Number(e.target.value)
                            }
                          })}
                          className="w-full accent-amber-500"
                        />
                      </div>

                      {/* MLP #7 Multi-layer non-recyclable */}
                      <div>
                        <div className="flex justify-between text-gray-300 mb-1">
                          <span>#7 Multi-Layer Packets (Chips/Snacks):</span>
                          <span className="text-rose-400 font-mono font-bold">
                            {inputs.shoppingPlasticsGranular?.mlpSnackPacketsWeekly} / week
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="35"
                          step="1"
                          value={inputs.shoppingPlasticsGranular?.mlpSnackPacketsWeekly || 8}
                          onChange={(e) => setInputs({
                            ...inputs,
                            shoppingPlasticsGranular: {
                              ...inputs.shoppingPlasticsGranular!,
                              mlpSnackPacketsWeekly: Number(e.target.value)
                            }
                          })}
                          className="w-full accent-rose-500"
                        />
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-[#030c08] border border-purple-950 text-[11px] font-mono flex justify-between text-gray-400">
                      <span>Total Plastic: <strong className="text-purple-300">{result.granularAuditDetails?.shoppingPlastics?.totalPlasticKgPerYear} kg/yr</strong></span>
                      <span>Plastic Carbon: <strong className="text-purple-300">{result.granularAuditDetails?.shoppingPlastics?.plasticCarbonTonnes} t CO2e/yr</strong></span>
                      <span className="text-rose-400">MLP Foil: Non-Recyclable</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. DAILY DEVICE & DIGITAL ECOSYSTEM */}
            <div className="bg-[#04110a] rounded-xl border border-emerald-800/60 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-950 pb-2">
                <span className="font-bold text-cyan-400 flex items-center space-x-1.5 font-display text-sm">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <span>4. Digital Device & Cloud Telemetry:</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                  IEA Data Center & Device Model
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-gray-300 mb-1">
                    <span>Smartphone Screen & Charging:</span>
                    <span className="text-cyan-300 font-mono font-bold">
                      {inputs.deviceUsage?.smartphoneHoursPerDay} Hours / Day
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="14"
                    step="0.5"
                    value={inputs.deviceUsage?.smartphoneHoursPerDay || 4.5}
                    onChange={(e) => setInputs({
                      ...inputs,
                      deviceUsage: { ...inputs.deviceUsage!, smartphoneHoursPerDay: Number(e.target.value) }
                    })}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-gray-300 mb-1">
                    <span>Laptop / Desktop Computing:</span>
                    <span className="text-emerald-300 font-mono font-bold">
                      {inputs.deviceUsage?.laptopPcHoursPerDay} Hours / Day
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="16"
                    step="0.5"
                    value={inputs.deviceUsage?.laptopPcHoursPerDay || 7}
                    onChange={(e) => setInputs({
                      ...inputs,
                      deviceUsage: { ...inputs.deviceUsage!, laptopPcHoursPerDay: Number(e.target.value) }
                    })}
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Standard Commute & Diet quick controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-[#04110a] p-3 rounded-lg border border-emerald-950 space-y-1.5">
                <span className="font-semibold text-emerald-400 flex items-center space-x-1.5">
                  <Car className="w-3.5 h-3.5" />
                  <span>Commuting ({inputs.carKmPerWeek} km/wk):</span>
                </span>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  value={inputs.carKmPerWeek}
                  onChange={(e) => setInputs({ ...inputs, carKmPerWeek: Number(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="bg-[#04110a] p-3 rounded-lg border border-emerald-950 space-y-1.5">
                <span className="font-semibold text-emerald-300 flex items-center space-x-1.5">
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Diet & Food Profile:</span>
                </span>
                <select
                  value={inputs.dietType}
                  onChange={(e) => setInputs({ ...inputs, dietType: e.target.value as any })}
                  className="w-full bg-[#061810] border border-emerald-800/40 rounded px-2.5 py-1.5 text-emerald-300 text-xs"
                >
                  <option value="heavy_meat">Heavy Meat (~3.3t CO2e)</option>
                  <option value="medium_meat">Average Omnivore (~2.5t CO2e)</option>
                  <option value="pescatarian">Pescatarian (~1.9t CO2e)</option>
                  <option value="vegetarian">Vegetarian (~1.5t CO2e)</option>
                  <option value="vegan">Vegan (~1.0t CO2e)</option>
                </select>
              </div>
            </div>
            </>
          )}

          </div>
        </div>

        {/* Right Column: Visual Breakdown & Benchmark Comparisons */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Total Calculated Footprint Card */}
          <div className="glass-panel rounded-xl p-6 border border-emerald-500/40 text-center space-y-3 relative overflow-hidden">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest block">
              Calculated Total Annual Greenhouse Gas Emissions
            </span>
            <div className="text-6xl font-extrabold text-white font-display">
              {result.totalCarbonTonnes} <span className="text-xl font-normal text-emerald-400">Tonnes CO2e</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
              <span className="text-gray-400">Primary Driver:</span>
              <span className="text-amber-400 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                {result.largestContributor}
              </span>
              <span className={`px-2 py-0.5 rounded border ${
                result.benchmarkComparison.percentDiffVsBenchmark > 0 
                  ? 'bg-rose-950 text-rose-300 border-rose-800' 
                  : 'bg-emerald-950 text-emerald-300 border-emerald-800'
              }`}>
                {result.benchmarkComparison.percentDiffVsBenchmark > 0 ? `+${result.benchmarkComparison.percentDiffVsBenchmark}%` : `${result.benchmarkComparison.percentDiffVsBenchmark}%`} vs {activeCountryNDC.name} Baseline
              </span>
            </div>
          </div>

          {/* Sub-Regional & NDC Benchmark Comparison Bar Chart */}
          <div className="glass-panel rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white font-display">
                Location & NDC Target Benchmark (t CO2e / yr)
              </h4>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
                {activeCountryNDC.flagEmoji} {activeCountryNDC.name}
              </span>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={benchmarkData} layout="vertical" margin={{ top: 5, right: 30, left: 45, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0a2a1b" horizontal={false} />
                  <XAxis type="number" stroke="#4ade80" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" stroke="#4ade80" tick={{ fill: '#d1d5db', fontSize: 11 }} width={135} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#061810', borderColor: '#10b981', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val) => [`${val} Tonnes CO2e`, 'Annual Baseline']}
                  />
                  <Bar dataKey="tonnes" radius={[0, 4, 4, 0]}>
                    {benchmarkData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <p className="text-[11px] font-mono text-gray-400 text-center">
              Comparing your calculated footprint directly against <strong>{activeCountryNDC.name}'s</strong> national baseline ({activeCountryNDC.nationalPerCapitaBaseline}t) and the <strong>2.0 Tonne Paris 2030 Limit</strong>.
            </p>
          </div>

          {/* Elementary Disaggregation Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#030c08] p-3.5 rounded-xl border border-emerald-950 space-y-1">
              <span className="text-gray-400 text-[10px] font-mono block">ANNUAL PLASTIC LOAD:</span>
              <div className="text-lg font-bold text-purple-300 font-display">
                {result.granularAuditDetails?.shoppingPlastics?.totalPlasticKgPerYear || 28} kg
              </div>
              <span className="text-[10px] text-gray-400 block font-mono">
                {result.granularAuditDetails?.shoppingPlastics?.recyclableSharePercent}% recyclable polymers
              </span>
            </div>

            <div className="bg-[#030c08] p-3.5 rounded-xl border border-emerald-950 space-y-1">
              <span className="text-gray-400 text-[10px] font-mono block">AC ELECTRICAL DRAW:</span>
              <div className="text-lg font-bold text-cyan-300 font-display">
                {result.granularAuditDetails?.applianceElectricity?.acKwhPerMonth || 95} kWh/mo
              </div>
              <span className="text-[10px] text-gray-400 block font-mono">
                ~{result.granularAuditDetails?.applianceElectricity?.acAnnualTonnesCO2 || 0.8} t CO2e/yr
              </span>
            </div>
          </div>

          {/* Prioritized Reduction Pathways */}
          <div className="glass-panel rounded-xl p-6 space-y-3">
            <h4 className="text-sm font-bold text-white font-display flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              <span>Prioritized Reduction Pathways ({activeCountryNDC.currencySymbol})</span>
            </h4>

            <div className="space-y-2.5">
              {result.reductionOpportunities.map((opp, idx) => (
                <div key={idx} className="bg-[#04110a] p-3 rounded-lg border border-emerald-950 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-gray-200 block">{opp.action}</span>
                    <span className="text-[11px] text-emerald-400 font-mono">
                      Save ~{opp.potentialReductionTonnes} t CO2e/yr · {opp.annualCostDelta}
                    </span>
                  </div>
                  <button
                    onClick={() => handleAddGoalFromOpportunity(opp.action)}
                    className="shrink-0 px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-300 text-[11px] font-mono transition-colors cursor-pointer"
                  >
                    + Add to Planner
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
