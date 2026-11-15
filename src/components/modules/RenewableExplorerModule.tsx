import React, { useState } from 'react';
import { 
  Sun, 
  Wind, 
  Waves, 
  Flame, 
  BatteryCharging, 
  Sparkles, 
  Info, 
  DollarSign, 
  Calendar, 
  Layers, 
  CheckCircle2, 
  TrendingDown,
  ArrowRight
} from 'lucide-react';
import { 
  calculateSolarPotential, 
  SolarSimulatorResult, 
  RENEWABLE_TECHNOLOGIES, 
  RenewableTechnologyInfo 
} from '../../services/solarPotentialEngine';
import { DataProvenance } from '../../types';

interface RenewableExplorerModuleProps {
  onInspectProvenance: (prov: DataProvenance) => void;
}

export const RenewableExplorerModule: React.FC<RenewableExplorerModuleProps> = ({ onInspectProvenance }) => {
  // Simulator inputs
  const [roofArea, setRoofArea] = useState<number>(100); // m²
  const [solarIrradiance, setSolarIrradiance] = useState<number>(5.2); // kWh/m²/day (NASA POWER avg)
  const [panelEfficiency, setPanelEfficiency] = useState<number>(21); // % (Mono PERC)
  const [gridTariff, setGridTariff] = useState<number>(0.12); // $ / kWh (or ~₹10/kWh)
  const [installedCostPerWatt, setInstalledCostPerWatt] = useState<number>(1.05); // $/W
  
  const [selectedTech, setSelectedTech] = useState<RenewableTechnologyInfo>(RENEWABLE_TECHNOLOGIES[0]);

  // Compute simulation
  const result: SolarSimulatorResult = calculateSolarPotential({
    roofAreaSqMeters: roofArea,
    solarIrradianceKwhM2Day: solarIrradiance,
    panelEfficiencyPercent: panelEfficiency,
    systemLossFactor: 0.78, // inverter, wiring, dust derate
    costPerWattInstalled: installedCostPerWatt,
    gridTariffPerKwh: gridTariff
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 mb-1">
            <Sun className="w-4 h-4" />
            <span>CLEAN ENERGY TRANSITION ENGINE</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-display">
            Renewable Energy Potential Simulator
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            NREL PVWatts-aligned rooftop photovoltaic modeling & clean technology spectrum analysis.
          </p>
        </div>

        <button
          onClick={() => onInspectProvenance(result.provenance)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#061810] border border-amber-500/40 text-amber-300 text-xs font-mono hover:bg-amber-950/40 transition-colors cursor-pointer"
        >
          <Info className="w-4 h-4 text-amber-400" />
          <span>Simulation Assumptions & Physics</span>
        </button>
      </div>

      {/* ROOFTOP SOLAR PHOTOVOLTAIC SIMULATOR */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-amber-500/30 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-950 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-950 border border-amber-500/40 text-amber-400">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-display">
                Rooftop Solar PV Economic & Carbon Model
              </h2>
              <p className="text-xs text-gray-400 font-mono">
                Uses NASA POWER satellite daily global horizontal irradiance (GHI) and regional grid displacement
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800">
            System Size: {result.systemSizeKw} kWp
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Controls */}
          <div className="lg:col-span-7 space-y-5 text-xs font-sans">
            <div>
              <div className="flex justify-between text-gray-300 mb-1.5">
                <span>Usable Rooftop Area:</span>
                <span className="text-amber-400 font-mono font-bold">{roofArea} m² (~{(roofArea * 10.76).toFixed(0)} sq ft)</span>
              </div>
              <input
                type="range"
                min="20"
                max="1000"
                step="10"
                value={roofArea}
                onChange={(e) => setRoofArea(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-1.5">
                <span>Daily Solar Irradiance (GHI from NASA POWER):</span>
                <span className="text-cyan-400 font-mono font-bold">{solarIrradiance} kWh / m² / day</span>
              </div>
              <input
                type="range"
                min="3.0"
                max="7.0"
                step="0.1"
                value={solarIrradiance}
                onChange={(e) => setSolarIrradiance(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-gray-400 font-mono block mb-1">Local Electric Grid Tariff ($/kWh):</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.04"
                  max="0.45"
                  value={gridTariff}
                  onChange={(e) => setGridTariff(Number(e.target.value))}
                  className="w-full bg-[#04110a] border border-amber-900/60 rounded-lg px-3 py-2 text-amber-300 font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-gray-400 font-mono block mb-1">Turnkey Installed Cost ($/Watt):</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.60"
                  max="2.50"
                  value={installedCostPerWatt}
                  onChange={(e) => setInstalledCostPerWatt(Number(e.target.value))}
                  className="w-full bg-[#04110a] border border-amber-900/60 rounded-lg px-3 py-2 text-amber-300 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-5 bg-[#030c08] border border-amber-500/40 rounded-xl p-6 text-center space-y-4 shadow-xl">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
              Estimated Annual Generation
            </span>
            <div className="text-5xl font-extrabold text-amber-400 font-display">
              {result.annualGenerationKwh.toLocaleString()}{' '}
              <span className="text-xl font-normal text-gray-400">kWh / yr</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-gray-300 border-b border-amber-950 pb-1">
                <span>Annual Power Bill Savings:</span>
                <span className="text-emerald-400 font-bold">{result.annualFinancialSavings}</span>
              </div>
              <div className="flex justify-between text-gray-300 border-b border-amber-950 pb-1">
                <span>Estimated Upfront System Cost:</span>
                <span className="text-white font-bold">{result.totalSystemCost}</span>
              </div>
              <div className="flex justify-between text-gray-300 border-b border-amber-950 pb-1">
                <span>Simple Payback Timeline:</span>
                <span className="text-cyan-300 font-bold">{result.simplePaybackYears} Years</span>
              </div>
              <div className="flex justify-between text-gray-300 border-b border-amber-950 pb-1">
                <span>25-Year Cumulative Net Profit:</span>
                <span className="text-emerald-300 font-bold">{result.twentyFiveYearSavings}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Avoided Grid Emissions:</span>
                <span className="text-emerald-400 font-bold">{result.annualCo2AvoidedTonnes} t CO2e / yr (~{result.treesEquivalent} trees)</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* RENEWABLE TECHNOLOGIES EXPLORER DIRECTORY */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xl font-bold text-white font-display">
              Comprehensive Renewable Technologies Spectrum
            </h3>
            <p className="text-xs text-gray-400 font-mono">
              Evaluate levelized cost of energy (LCOE), operational efficiencies, and grid roles.
            </p>
          </div>
        </div>

        {/* Tech tabs */}
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          {RENEWABLE_TECHNOLOGIES.map((tech) => (
            <button
              key={tech.name}
              onClick={() => setSelectedTech(tech)}
              className={`px-3 py-2 rounded-lg border transition-all cursor-pointer flex items-center space-x-1.5 ${
                selectedTech.name === tech.name 
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/60 font-bold shadow-md' 
                  : 'bg-[#04110a] text-gray-400 border-emerald-950 hover:text-white'
              }`}
            >
              <span>{tech.name}</span>
            </button>
          ))}
        </div>

        {/* Selected Tech Card */}
        <div className="glass-panel rounded-xl p-6 space-y-5 border border-emerald-900/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-950 pb-3">
            <div>
              <span className="text-xs font-mono text-amber-400 font-bold">{selectedTech.category} Architecture</span>
              <h4 className="text-lg font-bold text-white">{selectedTech.name}</h4>
            </div>
            <div className="text-right font-mono text-xs">
              <span className="text-gray-400 block text-[10px]">LEVELIZED COST (LCOE):</span>
              <span className="text-emerald-400 font-bold">{selectedTech.levelizedCostOfEnergy}</span>
            </div>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed">
            {selectedTech.technologyOverview}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
            <div className="bg-[#04110a] p-3 rounded-lg border border-emerald-950 space-y-1">
              <span className="text-gray-400 font-mono text-[10px] block">Conversion Efficiency:</span>
              <span className="font-semibold text-white">{selectedTech.efficiencyRange}</span>
            </div>
            <div className="bg-[#04110a] p-3 rounded-lg border border-emerald-950 space-y-1">
              <span className="text-gray-400 font-mono text-[10px] block">Ideal Deployment Use-Case:</span>
              <span className="text-gray-200">{selectedTech.idealApplication}</span>
            </div>
            <div className="bg-[#04110a] p-3 rounded-lg border border-emerald-950 space-y-1">
              <span className="text-gray-400 font-mono text-[10px] block">Environmental Benefits:</span>
              <span className="text-emerald-300">{selectedTech.environmentalBenefits}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/40 text-xs text-gray-300 space-y-1">
            <span className="font-mono text-amber-300 font-bold text-[11px] block">Regional & Intermittent Limitations:</span>
            <p className="text-[11px] leading-relaxed text-gray-300">{selectedTech.regionalLimitations}</p>
          </div>
        </div>

      </div>

    </div>
  );
};
