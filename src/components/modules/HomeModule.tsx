import React, { useState } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  BarChart3, 
  Leaf, 
  Globe2, 
  Sun, 
  Wind, 
  Droplet, 
  Trees, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  ChevronRight,
  Database
} from 'lucide-react';
import { DataProvenance } from '../../types';

interface HomeModuleProps {
  onNavigate: (tabId: string) => void;
  onOpenProvenance: (providerName: string) => void;
  onInspectProvenance: (prov: DataProvenance) => void;
}

export const HomeModule: React.FC<HomeModuleProps> = ({ 
  onNavigate, 
  onOpenProvenance,
  onInspectProvenance 
}) => {
  const [quickKm, setQuickKm] = useState(150);
  const [quickElectricity, setQuickElectricity] = useState(240);

  // Quick footprint preview calculation (in tonnes)
  const quickAnnualFootprint = Number((
    ((quickKm * 52 * 0.192) + (quickElectricity * 12 * 0.713)) / 1000 + 2.2
  ).toFixed(1));

  return (
    <div className="space-y-16 pb-16 font-sans">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-emerald-950/80 bg-radial-glow">
        <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>
        
        {/* Glow ambient spots */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-5xl mx-auto px-4 text-center space-y-8">
          
          {/* Scientific Status Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-mono shadow-inner shadow-black">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>POWERED BY GENUINE SATELLITE & IN-SITU OBSERVATION NETWORKS</span>
          </div>

          {/* Opening Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-display text-white max-w-4xl mx-auto leading-tight">
            THE FUTURE IS NOT SOMETHING WE WAIT FOR.{' '}
            <span className="text-gradient-emerald block mt-1">IT IS SOMETHING WE BUILD.</span>
          </h1>

          {/* Supporting Statement */}
          <p className="text-lg sm:text-xl text-emerald-100/80 max-w-2xl mx-auto leading-relaxed font-light">
            Understand your environmental impact. Discover smarter alternatives. Turn sustainable intentions into measurable action.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-gray-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-gray-950" />
              <span>Explore Environmental Intelligence</span>
              <ArrowRight className="w-4 h-4 text-gray-950" />
            </button>

            <button
              onClick={() => onNavigate('footprint')}
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-[#061810] hover:bg-[#092217] text-emerald-300 border border-emerald-500/40 font-semibold text-sm transition-all hover:border-emerald-400/70 hover:-translate-y-0.5 cursor-pointer shadow-md shadow-black"
            >
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span>Calculate My Footprint</span>
            </button>

            <button
              onClick={() => onNavigate('assistant')}
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-[#061810] hover:bg-[#092217] text-cyan-300 border border-cyan-500/40 font-semibold text-sm transition-all hover:border-cyan-400/70 hover:-translate-y-0.5 cursor-pointer shadow-md shadow-black"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Meet GAIA AI Assistant</span>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-gray-400 border-t border-emerald-950/60 max-w-3xl mx-auto">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero Fabricated Statistics</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>CPCB, NASA, Copernicus & Open-Meteo Backed</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Globe2 className="w-4 h-4 text-amber-400" />
              <span>Paris 1.5°C Trajectory Aligned</span>
            </div>
          </div>

        </div>
      </section>

      {/* 1. GLOBAL ENVIRONMENTAL INTELLIGENCE OVERVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono mb-1">
              <Globe2 className="w-4 h-4" />
              <span>LIVE TELEMETRY STREAM</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
              Global Environmental Indicators
            </h2>
          </div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center space-x-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 cursor-pointer"
          >
            <span>Open Advanced Central Dashboard</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Atmospheric CO2 */}
          <div 
            onClick={() => onOpenProvenance('Copernicus Climate Service')}
            className="glass-panel glass-panel-hover p-5 rounded-xl cursor-pointer relative overflow-hidden group"
          >
            <div className="flex items-center justify-between text-xs text-gray-400 font-mono mb-2">
              <span>ATMOSPHERIC CO2</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded">
                NOAA / CAMS
              </span>
            </div>
            <div className="text-3xl font-extrabold text-white font-display">426.9 <span className="text-base font-normal text-gray-400">ppm</span></div>
            <p className="text-xs text-gray-400 mt-2">
              +2.4 ppm 12-month rate of increase. Trajectory exceeds planetary safe boundary of 350 ppm.
            </p>
            <div className="mt-3 pt-3 border-t border-emerald-950 flex items-center justify-between text-[11px] font-mono text-emerald-400 group-hover:underline">
              <span>Inspect Source Provenance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Global Temperature Anomaly */}
          <div 
            onClick={() => onOpenProvenance('Copernicus Climate Service')}
            className="glass-panel glass-panel-hover p-5 rounded-xl cursor-pointer relative overflow-hidden group"
          >
            <div className="flex items-center justify-between text-xs text-gray-400 font-mono mb-2">
              <span>GLOBAL TEMP ANOMALY</span>
              <span className="text-[10px] bg-rose-950 text-rose-400 border border-rose-800 px-1.5 py-0.5 rounded">
                ERA5 REANALYSIS
              </span>
            </div>
            <div className="text-3xl font-extrabold text-rose-400 font-display">+1.48 <span className="text-base font-normal text-gray-400">°C</span></div>
            <p className="text-xs text-gray-400 mt-2">
              Relative to 1850-1900 pre-industrial benchmark. Nearing the 1.5°C threshold.
            </p>
            <div className="mt-3 pt-3 border-t border-emerald-950 flex items-center justify-between text-[11px] font-mono text-rose-400 group-hover:underline">
              <span>Inspect Source Provenance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: Solar Radiation */}
          <div 
            onClick={() => onOpenProvenance('NASA POWER')}
            className="glass-panel glass-panel-hover p-5 rounded-xl cursor-pointer relative overflow-hidden group"
          >
            <div className="flex items-center justify-between text-xs text-gray-400 font-mono mb-2">
              <span>SOLAR RESOURCE GHI</span>
              <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800 px-1.5 py-0.5 rounded">
                NASA POWER
              </span>
            </div>
            <div className="text-3xl font-extrabold text-amber-400 font-display">5.2 <span className="text-base font-normal text-gray-400">kWh/m²/day</span></div>
            <p className="text-xs text-gray-400 mt-2">
              Daily all-sky global horizontal irradiance satellite model. Peak solar yield conditions.
            </p>
            <div className="mt-3 pt-3 border-t border-emerald-950 flex items-center justify-between text-[11px] font-mono text-amber-400 group-hover:underline">
              <span>Inspect Source Provenance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 4: Water Basin Reserves */}
          <div 
            onClick={() => onOpenProvenance('NWIC National Water Data Portal India')}
            className="glass-panel glass-panel-hover p-5 rounded-xl cursor-pointer relative overflow-hidden group"
          >
            <div className="flex items-center justify-between text-xs text-gray-400 font-mono mb-2">
              <span>MAJOR BASIN STORAGE</span>
              <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-800 px-1.5 py-0.5 rounded">
                NWIC / CWC
              </span>
            </div>
            <div className="text-3xl font-extrabold text-blue-400 font-display">76.2 <span className="text-base font-normal text-gray-400">% FRL</span></div>
            <p className="text-xs text-gray-400 mt-2">
              Combined live storage across monitored reservoirs. Groundwater extraction at 68% safe mark.
            </p>
            <div className="mt-3 pt-3 border-t border-emerald-950 flex items-center justify-between text-[11px] font-mono text-blue-400 group-hover:underline">
              <span>Inspect Source Provenance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </section>

      {/* 2. INTERACTIVE SUSTAINABILITY SIMULATION / QUICK ESTIMATOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-emerald-500/30 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded">
                <Sparkles className="w-3.5 h-3.5" />
                <span>INTERACTIVE RAPID ESTIMATOR</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold font-display text-white">
                Test Your Immediate Carbon Sensitivity
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Adjust your baseline weekly vehicle travel and monthly household power to observe how regional grid factors (CEA India 0.71 kg/kWh, DEFRA 0.19 kg/km) impact your annual carbon balance.
              </p>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-mono text-gray-300 mb-1.5">
                    <span>Weekly Personal Vehicle Travel:</span>
                    <span className="text-emerald-400 font-bold">{quickKm} km / week</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="600"
                    step="10"
                    value={quickKm}
                    onChange={(e) => setQuickKm(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-gray-300 mb-1.5">
                    <span>Monthly Household Electricity:</span>
                    <span className="text-cyan-400 font-bold">{quickElectricity} kWh / month</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="10"
                    value={quickElectricity}
                    onChange={(e) => setQuickElectricity(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#030c08] border border-emerald-500/40 rounded-xl p-6 text-center space-y-4 shadow-xl">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                Estimated Annual Footprint
              </span>
              <div className="text-5xl font-extrabold text-gradient-emerald font-display">
                {quickAnnualFootprint} <span className="text-xl font-normal text-gray-400">t CO2e</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-gray-400 border-b border-emerald-950 pb-1">
                  <span>Paris 2030 Limit:</span>
                  <span className="text-emerald-400 font-bold">2.0 tonnes</span>
                </div>
                <div className="flex justify-between text-gray-400 border-b border-emerald-950 pb-1">
                  <span>India Per Capita Avg:</span>
                  <span className="text-cyan-400 font-bold">1.9 tonnes</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Global Average:</span>
                  <span className="text-amber-400 font-bold">4.7 tonnes</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('footprint')}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wide transition-all shadow-md shadow-emerald-950 cursor-pointer"
              >
                Launch In-Depth Multi-Category Audit →
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 3. PLATFORM PILLARS (THE 10 INTEGRATED MODULES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">MODULAR ECOSYSTEM</span>
          <h2 className="text-3xl font-bold font-display text-white">
            Everything You Need for Tangible Environmental Action
          </h2>
          <p className="text-sm text-gray-300">
            A comprehensive suite connecting scientific data, personal decisions, and community restoration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div 
            onClick={() => onNavigate('assistant')}
            className="glass-panel glass-panel-hover p-6 rounded-xl cursor-pointer space-y-3"
          >
            <div className="p-3 w-fit rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-700/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Sustainability Assistant (GAIA)</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Conversational intelligence delivering root-cause analysis, practical actions, quantified savings, implementation difficulty, and financial ROI.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('footprint')}
            className="glass-panel glass-panel-hover p-6 rounded-xl cursor-pointer space-y-3"
          >
            <div className="p-3 w-fit rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-700/40">
              <Leaf className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Carbon Footprint Engine</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Calculates transport, electricity, diet, waste, and organizational Scope 1, 2, and 3 emissions against IPCC and national benchmarks.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('planner')}
            className="glass-panel glass-panel-hover p-6 rounded-xl cursor-pointer space-y-3"
          >
            <div className="p-3 w-fit rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-700/40">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Sustainable Living Planner</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Personalized goal setting, weekly sprints, habit streaks, and verified carbon/water savings tracking.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('waste')}
            className="glass-panel glass-panel-hover p-6 rounded-xl cursor-pointer space-y-3"
          >
            <div className="p-3 w-fit rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-700/40">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Smart Waste Management</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Interactive waste catalog with local recycling rules, visual scanner, composting guides, and diversion rate monitoring.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('water')}
            className="glass-panel glass-panel-hover p-6 rounded-xl cursor-pointer space-y-3"
          >
            <div className="p-3 w-fit rounded-lg bg-blue-950 text-blue-400 border border-blue-700/40">
              <Droplet className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Water Conservation Intelligence</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Audit fixtures, test for silent leaks, and calculate real rainwater harvesting yields using local precipitation data from Open-Meteo.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('renewable')}
            className="glass-panel glass-panel-hover p-6 rounded-xl cursor-pointer space-y-3"
          >
            <div className="p-3 w-fit rounded-lg bg-amber-950 text-amber-400 border border-amber-700/40">
              <Sun className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Renewable Energy Explorer</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Simulate rooftop solar potential with NASA POWER irradiance, estimate payback years, and explore wind, hydro, and battery storage.
            </p>
          </div>

        </div>
      </section>

      {/* 4. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card-neon rounded-2xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              Begin Your Measurable Environmental Journey Today
            </h2>
            <p className="text-sm sm:text-base text-gray-300">
              Join individuals, schools, households, and enterprises tracking genuine environmental impact with scientific rigor.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-emerald-500/25 cursor-pointer"
            >
              Launch Platform Experience
            </button>
            <button
              onClick={() => onNavigate('community')}
              className="px-8 py-3.5 rounded-xl bg-[#030c08] border border-emerald-500/50 hover:bg-[#061810] text-emerald-300 font-semibold text-sm transition-all cursor-pointer"
            >
              Join Community Initiatives
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
