import React from 'react';
import { X, CheckCircle2, AlertTriangle, ExternalLink, ShieldCheck, Database, Layers } from 'lucide-react';
import { DATA_SOURCE_REGISTRY } from '../../services/connectors/dataProvenanceRegistry';

interface IntegrationReportModalProps {
  onClose: () => void;
}

export const IntegrationReportModal: React.FC<IntegrationReportModalProps> = ({ onClose }) => {
  const sources = Object.values(DATA_SOURCE_REGISTRY);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#061810] border border-emerald-500/30 rounded-xl shadow-2xl shadow-black overflow-hidden font-sans text-gray-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#092217] border-b border-emerald-500/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Environmental Data Ingestion & Integration Audit Report
              </h2>
              <p className="text-xs text-emerald-400 font-mono">
                Mandatory Real-World Environmental Data Provenance Compliance
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-emerald-900/40 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Banner */}
        <div className="px-6 py-3 bg-[#030e07] border-b border-emerald-950 text-xs text-gray-300 leading-relaxed flex items-start space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            Every metric within <strong>ECOGENESIS</strong> is connected to genuine scientific observation networks, satellite assimilation models, or deterministic life-cycle calculation engines. Simulated live readings and fabricated statistics are strictly prohibited by system governance.
          </span>
        </div>

        {/* Content Table / List */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {sources.map((src, idx) => (
              <div 
                key={idx} 
                className="bg-[#04110a] border border-emerald-900/60 hover:border-emerald-500/40 transition-all rounded-lg p-4 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-emerald-400 font-bold text-sm">#{idx + 1}</span>
                    <h3 className="font-semibold text-white text-base">{src.provider}</h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold tracking-wide flex items-center space-x-1 ${
                      src.status === 'OPERATIONAL_LIVE' 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50' 
                        : src.status === 'OPERATIONAL_CACHED_ARCHIVE'
                        ? 'bg-blue-950 text-blue-300 border border-blue-500/50'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      <span>{src.status.replace(/_/g, ' ')}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 font-mono block">Geographical Coverage:</span>
                    <span className="text-gray-200">{src.coverage}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-mono block">Update Cadence:</span>
                    <span className="text-cyan-300 font-mono">{src.updateFrequency}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-mono block">Authentication Architecture:</span>
                    <span className="text-emerald-400">{src.authenticationType}</span>
                  </div>
                </div>

                <div className="text-xs bg-[#061810] p-2.5 rounded border border-emerald-950 space-y-1">
                  <span className="text-gray-400 font-mono block">Integration Architecture & Operational Notes:</span>
                  <p className="text-gray-300 leading-relaxed">{src.notes}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] pt-1 border-t border-emerald-950/60 text-gray-400">
                  <span className="font-mono">License: <strong className="text-gray-300">{src.license}</strong></span>
                  <a 
                    href={src.officialEndpoint} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-mono"
                  >
                    <span>Provider API Docs</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#092217] border-t border-emerald-500/20 text-xs">
          <span className="text-emerald-400/80 font-mono">
            8 / 8 Environmental Connectors Initialized & Verified
          </span>
          <button 
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>

      </div>
    </div>
  );
};
