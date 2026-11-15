import React from 'react';
import { X, ExternalLink, ShieldCheck, Database, Calendar, Compass, FileText, CheckCircle2 } from 'lucide-react';
import { DataProvenance } from '../../types';

interface ProvenanceModalProps {
  provenance: DataProvenance | null;
  onClose: () => void;
}

export const ProvenanceModal: React.FC<ProvenanceModalProps> = ({ provenance, onClose }) => {
  if (!provenance) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#061810] border border-emerald-500/30 rounded-xl shadow-2xl shadow-black overflow-hidden font-sans text-gray-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#092217] border-b border-emerald-500/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-semibold text-white tracking-wide">Data Provenance Inspector</h3>
                <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium uppercase tracking-wider ${
                  provenance.qualityStatus === 'VERIFIED_LIVE' 
                    ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40' 
                    : provenance.qualityStatus === 'VERIFIED_ARCHIVE'
                    ? 'bg-blue-900/60 text-blue-300 border border-blue-500/40'
                    : 'bg-amber-900/60 text-amber-300 border border-amber-500/40'
                }`}>
                  {provenance.qualityStatus.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono mt-0.5">Scientific Traceability & Verification Record</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-emerald-900/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5 text-sm">
          
          {/* Grid of Key Properties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="bg-[#04110a] p-3.5 rounded-lg border border-emerald-900/60">
              <span className="text-xs text-gray-400 font-mono block">Data Provider:</span>
              <span className="font-semibold text-emerald-300 text-sm">{provenance.provider}</span>
            </div>

            <div className="bg-[#04110a] p-3.5 rounded-lg border border-emerald-900/60">
              <span className="text-xs text-gray-400 font-mono block">Dataset Identifier:</span>
              <span className="font-mono text-gray-200 text-xs">{provenance.datasetId}</span>
            </div>

            <div className="bg-[#04110a] p-3.5 rounded-lg border border-emerald-900/60">
              <span className="text-xs text-gray-400 font-mono block">Measurement Location:</span>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-gray-200 text-xs">{provenance.locationName}</span>
              </div>
              {provenance.coordinates && (
                <span className="text-[11px] font-mono text-gray-400 block mt-1">
                  ({provenance.coordinates.latitude.toFixed(4)}, {provenance.coordinates.longitude.toFixed(4)})
                </span>
              )}
            </div>

            <div className="bg-[#04110a] p-3.5 rounded-lg border border-emerald-900/60">
              <span className="text-xs text-gray-400 font-mono block">Measurement Parameter:</span>
              <span className="font-semibold text-gray-100 text-xs">{provenance.measurementParameter}</span>
            </div>

            <div className="bg-[#04110a] p-3.5 rounded-lg border border-emerald-900/60">
              <span className="text-xs text-gray-400 font-mono block">Original & Normalized Units:</span>
              <span className="font-mono text-xs text-cyan-300">{provenance.rawUnit}</span>
              <span className="text-xs text-gray-400 mx-1.5">→</span>
              <span className="font-mono text-xs text-emerald-300">{provenance.normalizedUnit}</span>
            </div>

            <div className="bg-[#04110a] p-3.5 rounded-lg border border-emerald-900/60">
              <span className="text-xs text-gray-400 font-mono block">Confidence Score:</span>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-24 bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full" 
                    style={{ width: `${provenance.confidenceScore}%` }}
                  ></div>
                </div>
                <span className="font-mono text-xs text-emerald-400 font-bold">{provenance.confidenceScore}%</span>
              </div>
            </div>

          </div>

          {/* Methodology */}
          <div className="bg-[#04110a] p-4 rounded-lg border border-emerald-900/60">
            <span className="text-xs text-gray-400 font-mono block mb-1">Scientific Methodology & Instrumentation:</span>
            <p className="text-xs leading-relaxed text-gray-300">{provenance.methodology}</p>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-[#04110a] p-3 rounded-lg border border-emerald-900/60">
              <span className="text-gray-400 block text-[11px]">Observation Timestamp:</span>
              <span className="text-gray-300">{new Date(provenance.observationTimestamp).toLocaleString()}</span>
            </div>
            <div className="bg-[#04110a] p-3 rounded-lg border border-emerald-900/60">
              <span className="text-gray-400 block text-[11px]">Ingestion Timestamp:</span>
              <span className="text-emerald-400">{new Date(provenance.retrievalTimestamp).toLocaleString()}</span>
            </div>
          </div>

          {/* License & Source URL */}
          <div className="bg-[#04110a] p-4 rounded-lg border border-emerald-900/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-mono">Applicable License:</span>
              <span className="text-xs text-emerald-400 font-medium">{provenance.license}</span>
            </div>
            {provenance.notes && (
              <p className="text-xs text-gray-400 italic pt-1 border-t border-emerald-950">
                Note: {provenance.notes}
              </p>
            )}
            <div className="pt-2">
              <a 
                href={provenance.sourceUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center space-x-1.5 text-xs text-emerald-400 hover:text-emerald-300 underline font-mono"
              >
                <span>View Official Source Provider Endpoint</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-[#092217] border-t border-emerald-500/20 text-xs text-gray-400">
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Traceable Environmental Integrity Standard</span>
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
