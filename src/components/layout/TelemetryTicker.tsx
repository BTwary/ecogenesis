import React from 'react';
import { Activity, Radio, Sun, Wind, Droplets, Globe, ShieldAlert } from 'lucide-react';

interface TelemetryTickerProps {
  onOpenProvenance: (providerName: string) => void;
}

export const TelemetryTicker: React.FC<TelemetryTickerProps> = ({ onOpenProvenance }) => {
  return (
    <div className="w-full bg-[#04110a] border-b border-emerald-500/20 px-4 py-1.5 flex items-center justify-between text-xs font-mono overflow-x-auto text-emerald-300/80">
      <div className="flex items-center space-x-2 shrink-0 pr-4 border-r border-emerald-900/50">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-semibold text-emerald-400 tracking-wider">ECO-TELEMETRY:</span>
        <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-700/40 px-1.5 py-0.5 rounded text-[10px]">
          LIVE SATELLITE & SENSOR STREAM
        </span>
      </div>

      <div className="flex items-center space-x-6 shrink-0 overflow-x-auto no-scrollbar py-0.5">
        <button 
          onClick={() => onOpenProvenance('Copernicus Climate Service')} 
          className="flex items-center space-x-1.5 hover:text-emerald-200 transition-colors cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-gray-400">Atmospheric CO2:</span>
          <span className="text-emerald-300 font-bold">426.9 ppm</span>
          <span className="text-[10px] text-amber-400 font-mono">(+2.4 ppm/yr)</span>
        </button>

        <button 
          onClick={() => onOpenProvenance('Copernicus Climate Service')}
          className="flex items-center space-x-1.5 hover:text-emerald-200 transition-colors cursor-pointer"
        >
          <Activity className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-gray-400">Global Temp Anomaly:</span>
          <span className="text-rose-400 font-bold">+1.48°C</span>
          <span className="text-[10px] text-gray-500">(vs 1850-1900)</span>
        </button>

        <button 
          onClick={() => onOpenProvenance('Open-Meteo')}
          className="flex items-center space-x-1.5 hover:text-emerald-200 transition-colors cursor-pointer"
        >
          <Wind className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-gray-400">Active Station AQI:</span>
          <span className="text-cyan-300 font-bold">Good to Moderate</span>
          <span className="text-[10px] text-emerald-400 font-mono">Open-Meteo / CPCB</span>
        </button>

        <button 
          onClick={() => onOpenProvenance('NASA POWER')}
          className="flex items-center space-x-1.5 hover:text-emerald-200 transition-colors cursor-pointer"
        >
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-gray-400">Solar Irradiance:</span>
          <span className="text-amber-300 font-bold">5.2 kWh/m²/day</span>
          <span className="text-[10px] text-gray-500">NASA POWER</span>
        </button>

        <button 
          onClick={() => onOpenProvenance('NWIC National Water Data Portal India')}
          className="flex items-center space-x-1.5 hover:text-emerald-200 transition-colors cursor-pointer"
        >
          <Droplets className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-gray-400">Major Basin Live Storage:</span>
          <span className="text-blue-300 font-bold">76.2% FRL</span>
          <span className="text-[10px] text-gray-500">CWC / NWIC</span>
        </button>
      </div>

      <div className="hidden lg:flex items-center space-x-2 pl-4 border-l border-emerald-900/50 shrink-0">
        <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span className="text-[10px] text-gray-400">UTC: {new Date().toISOString().slice(11, 19)}</span>
      </div>
    </div>
  );
};
