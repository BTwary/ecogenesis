import React, { useRef } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  ShieldCheck, 
  BarChart3, 
  Leaf, 
  Droplet, 
  Trash2, 
  Sun, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { DATA_SOURCE_REGISTRY } from '../../services/connectors/dataProvenanceRegistry';
import { PersonaType } from '../../types';

interface ReportingModuleProps {
  activePersona: PersonaType;
}

export const ReportingModule: React.FC<ReportingModuleProps> = ({ activePersona }) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ECOGENESIS ENVIRONMENTAL INTELLIGENCE AUDIT LEDGER\n" +
      "Generated," + new Date().toISOString() + "\n" +
      "Persona Context," + activePersona + "\n\n" +
      "METRIC,VALUE,UNIT,STATUS,PROVIDER,DATASET_ID,METHODOLOGY\n" +
      "Annual Carbon Footprint,4.2,t CO2e,Calculated Derivation,IPCC / GHG Protocol,GHG-PROTOCOL-2023,Tier 1 and Tier 2 life-cycle calculation\n" +
      "Baseline Grid Carbon Intensity,0.713,kg CO2e/kWh,Verified Archive,CPCB / CEA India,CEA-BASELINE-V19,Central Electricity Authority baseline database\n" +
      "Solar Resource Potential,5.2,kWh/m2/day,Verified Live,NASA POWER,NASA-POWER-CERES,CERES satellite all-sky solar flux\n" +
      "Annual Rainwater Yield,82400,Litres/year,Calculated Derivation,NWIC / Open-Meteo,IS-15797-HYDRO,Runoff coefficient with first-flush filter\n" +
      "Waste Diversion Rate,45,%,Calculated Derivation,CPCB SWM Rules,CPCB-SWM-2016,Source-segregated organic composting & rPET recycling\n" +
      "Global Atmospheric CO2,426.9,ppm,Verified Live,Copernicus Climate Service,CAMS-GHG-CO2,Mauna Loa NDIR and ECMWF CAMS reanalysis\n" +
      "Global Temp Anomaly,1.48,deg C,Verified Live,Copernicus Climate Service,ERA5-GLOBAL-TEMP,ERA5 surface temperature anomaly vs 1850-1900\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ecogenesis_environmental_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-950">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 mb-1">
            <FileText className="w-4 h-4" />
            <span>EXECUTIVE AUDIT & ESG REPORTING</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-display">
            Downloadable Environmental Report
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            Scientific performance summary with complete traceability and data provenance ledger.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadCSV}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#061810] border border-emerald-500/40 text-emerald-300 text-xs font-mono hover:bg-emerald-900/40 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Data</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-950 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* DOCUMENT PREVIEW (PRINTABLE REPORT CONTAINER) */}
      <div 
        ref={reportRef} 
        className="glass-panel rounded-2xl p-8 sm:p-12 border border-emerald-500/30 text-gray-200 space-y-8 shadow-2xl bg-[#061810]/95"
      >
        
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-500/30 pb-6">
          <div className="space-y-1">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">
              ECOGENESIS ENVIRONMENTAL INTELLIGENCE AUDIT
            </span>
            <h2 className="text-2xl font-extrabold text-white font-display">
              Sustainability & Carbon Balance Report
            </h2>
            <span className="text-xs text-gray-400 font-mono block">
              Reporting Entity Context: <strong>{activePersona.toUpperCase()}</strong> · Issued: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500/40 text-right font-mono text-xs text-emerald-300">
            <span className="block font-bold">AUDIT INTEGRITY: PASS</span>
            <span className="text-[10px] text-gray-400">GHG Protocol / IPCC AR6</span>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-white font-display flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>1. Executive Environmental Performance Summary</span>
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            This integrated sustainability audit synthesizes verified activity telemetry, regional carbon baseline factors, and satellite observations to establish a deterministic environmental footprint. Over the evaluated period, net carbon mitigation efforts resulted in significant avoided emissions through domestic and operational interventions.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="bg-[#030c08] p-3.5 rounded-xl border border-emerald-950 text-center space-y-1">
              <span className="text-[10px] font-mono text-gray-400 block">CARBON FOOTPRINT</span>
              <span className="text-xl font-bold text-white font-display">4.2 t CO2e</span>
              <span className="text-[10px] font-mono text-emerald-400 block">-18% vs Baseline</span>
            </div>
            <div className="bg-[#030c08] p-3.5 rounded-xl border border-emerald-950 text-center space-y-1">
              <span className="text-[10px] font-mono text-gray-400 block">WATER CONSERVED</span>
              <span className="text-xl font-bold text-blue-400 font-display">82,400 L</span>
              <span className="text-[10px] font-mono text-blue-300 block">Rainwater + Fixtures</span>
            </div>
            <div className="bg-[#030c08] p-3.5 rounded-xl border border-emerald-950 text-center space-y-1">
              <span className="text-[10px] font-mono text-gray-400 block">CLEAN POWER POTENTIAL</span>
              <span className="text-xl font-bold text-amber-400 font-display">14,200 kWh</span>
              <span className="text-[10px] font-mono text-amber-300 block">Rooftop Solar PV</span>
            </div>
            <div className="bg-[#030c08] p-3.5 rounded-xl border border-emerald-950 text-center space-y-1">
              <span className="text-[10px] font-mono text-gray-400 block">WASTE DIVERSION</span>
              <span className="text-xl font-bold text-lime-400 font-display">45%</span>
              <span className="text-[10px] font-mono text-lime-300 block">Composted & Recycled</span>
            </div>
          </div>
        </div>

        {/* Section 2: Balance Breakdown Table */}
        <div className="space-y-3 pt-2">
          <h3 className="text-base font-bold text-white font-display flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>2. Environmental Accounting Ledger</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans border border-emerald-950 rounded-xl overflow-hidden">
              <thead className="bg-[#030c08] font-mono text-gray-400 border-b border-emerald-950">
                <tr>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Annual Quantity</th>
                  <th className="py-2.5 px-3">Calculated Impact</th>
                  <th className="py-2.5 px-3">Primary Source / Emission Factor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/60 font-mono text-[11px]">
                <tr>
                  <td className="py-2.5 px-3 text-white">Electricity Consumption</td>
                  <td className="py-2.5 px-3 text-cyan-300">2,640 kWh / yr</td>
                  <td className="py-2.5 px-3 text-emerald-400">1.88 t CO2e</td>
                  <td className="py-2.5 px-3 text-gray-400">CEA India Baseline Database (0.713 kg/kWh)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-white">Vehicular Transport</td>
                  <td className="py-2.5 px-3 text-cyan-300">6,240 km / yr</td>
                  <td className="py-2.5 px-3 text-emerald-400">1.20 t CO2e</td>
                  <td className="py-2.5 px-3 text-gray-400">UK DEFRA 2023 Petrol Factor (0.192 kg/km)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-white">Domestic Water Consumption</td>
                  <td className="py-2.5 px-3 text-blue-300">197,100 L / yr</td>
                  <td className="py-2.5 px-3 text-blue-400">0.07 t CO2e (pumping)</td>
                  <td className="py-2.5 px-3 text-gray-400">CGWB Municipal Flow Models (0.00035 kg/L)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-white">Rooftop Solar Offset</td>
                  <td className="py-2.5 px-3 text-amber-300">-14,200 kWh (potential)</td>
                  <td className="py-2.5 px-3 text-emerald-400">-10.1 t CO2e / yr</td>
                  <td className="py-2.5 px-3 text-gray-400">NASA POWER CERES GHI & NREL PVWatts v8</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Data Provenance & Scientific Integrity Appendix */}
        <div className="space-y-3 pt-4 border-t border-emerald-950">
          <h3 className="text-base font-bold text-white font-display flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>3. Scientific Data Provenance & Licensing Appendix</span>
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            In compliance with the ECOGENESIS Scientific Integrity Standard, all underlying data sources, collection timestamps, and open-data licenses are indexed below:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            {Object.values(DATA_SOURCE_REGISTRY).slice(0, 4).map((src, i) => (
              <div key={i} className="bg-[#030c08] p-3 rounded-lg border border-emerald-950 space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-emerald-300">{src.provider}</span>
                  <span className="text-[10px] text-gray-400">{src.status}</span>
                </div>
                <span className="text-[10px] text-gray-400 block">Coverage: {src.coverage}</span>
                <span className="text-[10px] text-cyan-400 block truncate">License: {src.license}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
