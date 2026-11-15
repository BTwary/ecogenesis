import React, { useState, useEffect } from 'react';
import { 
  Droplet, 
  CloudRain, 
  Gauge, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Info,
  DollarSign,
  TrendingDown,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { calculateRainwaterPotential, RainwaterResult } from '../../services/rainwaterEngine';
import { fetchHistoricalRainfall } from '../../services/connectors/openMeteoConnector';
import { DataProvenance } from '../../types';
import { INDIA_CITIES_DATABASE } from '../../services/indiaCitiesDatabase';

interface WaterIntelligenceModuleProps {
  onInspectProvenance: (prov: DataProvenance) => void;
}

export const WaterIntelligenceModule: React.FC<WaterIntelligenceModuleProps> = ({ onInspectProvenance }) => {
  // Rainwater Harvesting Calculator inputs with Indian city integration
  const [selectedCityId, setSelectedCityId] = useState<string>('in-dl-delhi');
  const [roofArea, setRoofArea] = useState<number>(120); // m²
  const [roofType, setRoofType] = useState<'concrete_tile' | 'metal_sheet' | 'corrugated_asbestos' | 'tar_gravel'>('concrete_tile');
  const [rainfallMm, setRainfallMm] = useState<number>(790); // default Delhi
  const [filterEfficiency, setFilterEfficiency] = useState<number>(0.85);

  // Leak Diagnostic Tool State
  const [meterStep, setMeterStep] = useState<number>(1);
  const [meterInitialReading, setMeterInitialReading] = useState<number>(1045.2);
  const [meterFinalReading, setMeterFinalReading] = useState<number>(1045.2);
  const [leakTested, setLeakTested] = useState<boolean>(false);

  // Household Water Consumption Audit inputs
  const [occupants, setOccupants] = useState<number>(4);
  const [showerMinutes, setShowerMinutes] = useState<number>(8);
  const [toiletType, setToiletType] = useState<'standard_single' | 'dual_flush_low'>('standard_single');
  const [aeratorsInstalled, setAeratorsInstalled] = useState<boolean>(false);

  // Compute Rainwater results
  const rainwaterResult: RainwaterResult = calculateRainwaterPotential({
    roofAreaSqMeters: roofArea,
    annualRainfallMm: rainfallMm,
    roofType,
    filterEfficiency
  });

  // Calculate daily household usage (Litres per day)
  // Standard shower ~12 LPM (or 6 LPM with aerator)
  const showerLpm = aeratorsInstalled ? 6 : 12;
  const showerDailyLitres = occupants * showerMinutes * showerLpm;
  // Toilet: single flush 10L vs dual flush 4.5L (assume 4 flushes/person/day)
  const flushLitresPer = toiletType === 'dual_flush_low' ? 4.5 : 10;
  const toiletDailyLitres = occupants * 4 * flushLitresPer;
  // Other domestic base (drinking, cooking, dishes, laundry) ~ 45 L/person/day
  const kitchenLaundryDailyLitres = occupants * 45;
  const totalDailyLitres = showerDailyLitres + toiletDailyLitres + kitchenLaundryDailyLitres;
  const lpcd = Math.round(totalDailyLitres / occupants); // Litres Per Capita per Day

  const hasLeak = meterFinalReading > meterInitialReading;
  const leakRateLph = hasLeak ? Math.round((meterFinalReading - meterInitialReading) * 1000 / 2) : 0; // if 2-hour window

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-blue-400 mb-1">
            <Droplet className="w-4 h-4" />
            <span>HYDROLOGICAL INTELLIGENCE SUITE</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-display">
            Water Conservation & Rainwater Harvesting
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            Scientific catchment yield modeling, leak diagnostics, and fixture flow optimization.
          </p>
        </div>

        <button
          onClick={() => onInspectProvenance(rainwaterResult.provenance)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#061810] border border-blue-500/40 text-blue-300 text-xs font-mono hover:bg-blue-950/40 transition-colors cursor-pointer"
        >
          <Info className="w-4 h-4 text-blue-400" />
          <span>Hydrological Methodology</span>
        </button>
      </div>

      {/* RAINWATER HARVESTING CALCULATOR */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-blue-500/30 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-950 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-950 border border-blue-500/40 text-blue-400">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-display">
                Rooftop Rainwater Harvesting Potential Simulator
              </h2>
              <p className="text-xs text-gray-400 font-mono">
                Calibrated against Bureau of Indian Standards IS 15797 and Open-Meteo precipitation models
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800">
            Yield = Area × Rain × Coeff × Filter
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Sliders and Selectors */}
          <div className="lg:col-span-7 space-y-5 text-xs font-sans">
            <div>
              <div className="flex justify-between text-gray-300 mb-1.5">
                <span>Rooftop Catchment Surface Area:</span>
                <span className="text-blue-300 font-mono font-bold">{roofArea} m² (~{(roofArea * 10.76).toFixed(0)} sq ft)</span>
              </div>
              <input
                type="range"
                min="30"
                max="500"
                step="10"
                value={roofArea}
                onChange={(e) => setRoofArea(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-1.5">
                <span>Select Indian City / District (IMD Climatological Preset):</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {INDIA_CITIES_DATABASE.find(c => c.id === selectedCityId)?.riverBasin}
                </span>
              </div>
              <select
                value={selectedCityId}
                onChange={(e) => {
                  setSelectedCityId(e.target.value);
                  const found = INDIA_CITIES_DATABASE.find(c => c.id === e.target.value);
                  if (found) {
                    setRainfallMm(found.annualRainfallMm);
                  }
                }}
                className="w-full bg-[#04110a] border border-blue-800/80 rounded-lg px-3 py-2 text-blue-300 font-medium focus:outline-none mb-3"
              >
                <optgroup label="All 28 State Capitals">
                  {INDIA_CITIES_DATABASE.filter(c => c.type === 'State Capital').map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}, {c.stateOrUT} (IMD Normal: {c.annualRainfallMm} mm/yr · {c.riverBasin})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="All 8 Union Territory Capitals">
                  {INDIA_CITIES_DATABASE.filter(c => c.type === 'UT Capital').map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}, {c.stateOrUT} (IMD Normal: {c.annualRainfallMm} mm/yr · {c.riverBasin})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Tier 2 Urban Hubs">
                  {INDIA_CITIES_DATABASE.filter(c => c.type === 'Tier 2').map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}, {c.stateOrUT} (IMD Normal: {c.annualRainfallMm} mm/yr · {c.riverBasin})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Tier 3 Regional Centers">
                  {INDIA_CITIES_DATABASE.filter(c => c.type === 'Tier 3').map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}, {c.stateOrUT} (IMD Normal: {c.annualRainfallMm} mm/yr · {c.riverBasin})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-1.5">
                <span>Annual Rainfall (Adjustable Slider or Auto-Set by City):</span>
                <span className="text-cyan-300 font-mono font-bold">{rainfallMm} mm / year</span>
              </div>
              <input
                type="range"
                min="100"
                max="3600"
                step="50"
                value={rainfallMm}
                onChange={(e) => setRainfallMm(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-gray-400 font-mono block mb-1">Catchment Material & Runoff Factor:</label>
                <select
                  value={roofType}
                  onChange={(e) => setRoofType(e.target.value as any)}
                  className="w-full bg-[#04110a] border border-blue-900/60 rounded-lg px-3 py-2 text-blue-300 focus:outline-none text-xs"
                >
                  <option value="concrete_tile">RCC Concrete / Tiles (0.85 Coeff)</option>
                  <option value="metal_sheet">Galvanized Metal Sheet (0.90 Coeff)</option>
                  <option value="corrugated_asbestos">Corrugated Sheet (0.80 Coeff)</option>
                  <option value="tar_gravel">Tar & Gravel Flat Roof (0.70 Coeff)</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400 font-mono block mb-1">First-Flush Filter Efficiency:</label>
                <select
                  value={filterEfficiency}
                  onChange={(e) => setFilterEfficiency(Number(e.target.value))}
                  className="w-full bg-[#04110a] border border-blue-900/60 rounded-lg px-3 py-2 text-blue-300 focus:outline-none text-xs"
                >
                  <option value={0.85}>Dual-Stage Sand & Mesh (85% Clean Yield)</option>
                  <option value={0.90}>Commercial Vortex Separator (90% Yield)</option>
                  <option value={0.75}>Basic Screen Diverter (75% Yield)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="lg:col-span-5 bg-[#030c08] border border-blue-500/40 rounded-xl p-6 text-center space-y-4 shadow-xl">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
              Estimated Annual Water Harvested
            </span>
            <div className="text-5xl font-extrabold text-blue-400 font-display">
              {rainwaterResult.annualHarvestLitres.toLocaleString()}{' '}
              <span className="text-xl font-normal text-gray-400">Litres</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-gray-300 border-b border-blue-950 pb-1">
                <span>Monthly Avg Accumulation:</span>
                <span className="text-cyan-300 font-bold">{rainwaterResult.monthlyAverageLitres.toLocaleString()} L / mo</span>
              </div>
              <div className="flex justify-between text-gray-300 border-b border-blue-950 pb-1">
                <span>Household Demand Covered:</span>
                <span className="text-emerald-400 font-bold">{rainwaterResult.householdDemandMetPercent}% of annual need</span>
              </div>
              <div className="flex justify-between text-gray-300 border-b border-blue-950 pb-1">
                <span>Tanker & Municipal Bill Offset:</span>
                <span className="text-amber-400 font-bold">{rainwaterResult.annualCostSavings}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Suggested Sump/Cistern Volume:</span>
                <span className="text-blue-300 font-bold">{rainwaterResult.suggestedSumpSizeLitres.toLocaleString()} Litres</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* TWO COLUMN: HOUSEHOLD WATER AUDIT & LEAK DIAGNOSTIC */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Household Fixture Audit */}
        <div className="lg:col-span-6 glass-panel rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-emerald-950 pb-3">
            <div className="flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white font-display">Domestic Water Fixture Audit</h3>
            </div>
            <span className="text-xs font-mono text-cyan-300 font-bold">
              {lpcd} LPCD (Benchmark: 135)
            </span>
          </div>

          <div className="space-y-4 text-xs font-sans">
            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span>Household Members / Occupants:</span>
                <span className="text-emerald-300 font-mono font-bold">{occupants} People</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                value={occupants}
                onChange={(e) => setOccupants(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span>Average Shower Duration:</span>
                <span className="text-cyan-300 font-mono font-bold">{showerMinutes} Minutes / Person</span>
              </div>
              <input
                type="range"
                min="3"
                max="20"
                value={showerMinutes}
                onChange={(e) => setShowerMinutes(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-gray-400 font-mono text-[10px] block">Toilet Flush System:</span>
                <select
                  value={toiletType}
                  onChange={(e) => setToiletType(e.target.value as any)}
                  className="w-full bg-[#04110a] border border-emerald-900 rounded px-2 py-1.5 text-emerald-300 text-xs"
                >
                  <option value="standard_single">Standard Single Flush (10 L)</option>
                  <option value="dual_flush_low">Dual Flush WaterSense (4.5 L)</option>
                </select>
              </div>

              <div>
                <span className="text-gray-400 font-mono text-[10px] block">Tap Aerator Retrofit:</span>
                <button
                  type="button"
                  onClick={() => setAeratorsInstalled(!aeratorsInstalled)}
                  className={`w-full py-1.5 px-2 rounded border text-xs font-mono transition-colors ${
                    aeratorsInstalled 
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold' 
                      : 'bg-[#04110a] border-emerald-900 text-gray-400'
                  }`}
                >
                  {aeratorsInstalled ? '✓ 6 LPM Aerators Active' : '+ Click to Add Aerators'}
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#030c08] border border-emerald-950 font-mono text-xs space-y-1.5">
              <div className="flex justify-between text-gray-300">
                <span>Estimated Daily Consumption:</span>
                <span className="text-blue-300 font-bold">{totalDailyLitres} Litres / Day</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Annual Domestic Footprint:</span>
                <span className="text-white font-bold">{Math.round(totalDailyLitres * 365).toLocaleString()} Litres / Year</span>
              </div>
              {aeratorsInstalled && (
                <span className="text-emerald-400 text-[11px] block pt-1 border-t border-emerald-950">
                  Aerator retrofit is currently saving ~{occupants * showerMinutes * 6 * 365} Litres / year!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Leak Prevention Diagnostic Test */}
        <div className="lg:col-span-6 glass-panel rounded-xl p-6 space-y-5">
          <div className="flex items-center space-x-2 border-b border-emerald-950 pb-3">
            <Gauge className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white font-display">2-Hour Meter Leak Diagnostic Test</h3>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed">
            Silent leaks from toilet flappers and subterranean pipes account for over 12% of lost household water. Perform this zero-cost diagnostic:
          </p>

          <div className="space-y-3 text-xs">
            <div className="bg-[#04110a] p-3 rounded-lg border border-emerald-950 space-y-1">
              <span className="font-mono text-amber-400 font-bold">STEP 1: Turn off all taps and water-consuming devices for 2 hours.</span>
              <p className="text-gray-400 text-[11px]">Ensure washing machines, dishwashers, and reverse-osmosis purifiers are paused.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-gray-400 font-mono text-[10px] block">Hour 0 Meter Reading (m³):</span>
                <input
                  type="number"
                  step="0.01"
                  value={meterInitialReading}
                  onChange={(e) => setMeterInitialReading(Number(e.target.value))}
                  className="w-full bg-[#030c08] border border-emerald-900 rounded px-2.5 py-1.5 text-gray-200 font-mono text-xs"
                />
              </div>
              <div>
                <span className="text-gray-400 font-mono text-[10px] block">Hour 2 Meter Reading (m³):</span>
                <input
                  type="number"
                  step="0.01"
                  value={meterFinalReading}
                  onChange={(e) => {
                    setMeterFinalReading(Number(e.target.value));
                    setLeakTested(true);
                  }}
                  className="w-full bg-[#030c08] border border-emerald-900 rounded px-2.5 py-1.5 text-gray-200 font-mono text-xs"
                />
              </div>
            </div>

            <div className="pt-2">
              {hasLeak ? (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Leak Detected: ~{leakRateLph} Litres / Hour continuous loss!</span>
                  </div>
                  <p className="text-[11px] text-gray-300">
                    Inspect toilet tank flapper valves first by putting 3 drops of food coloring in the cistern. If color seeps into bowl without flushing, replace the $5 flapper.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Meter verified stationary: Zero active concealed plumbing leaks detected.</span>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
