import React, { useState } from 'react';
import { 
  Trash2, 
  Recycle, 
  Search, 
  Camera, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  BookOpen, 
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';
import { WASTE_DATABASE, simulateImageClassification, VisualScanResult } from '../../services/wasteClassificationDatabase';
import { WasteItem } from '../../types';

export const WasteManagementModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<WasteItem>(WASTE_DATABASE[0]);
  const [scanResult, setScanResult] = useState<VisualScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Filtered waste catalog
  const filteredItems = WASTE_DATABASE.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.preparationInstructions.some(i => i.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          item.recyclingRules.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setTimeout(() => {
      const result = simulateImageClassification(file.name);
      setScanResult(result);
      setSelectedItem(result.detectedItem);
      setIsScanning(false);
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 mb-1">
            <Trash2 className="w-4 h-4" />
            <span>CIRCULAR RESOURCE INTELLIGENCE</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-display">
            Smart Waste Management & Segregation
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            Scientific sorting instructions, contamination prevention, and optical material inspection.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-lg text-xs font-mono text-emerald-300">
          <Recycle className="w-4 h-4 text-emerald-400" />
          <span>Local MRF Protocol Compliant</span>
        </div>
      </div>

      {/* AI Visual Material Scanner Card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-emerald-500/30 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center space-x-2 text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded">
              <Camera className="w-3.5 h-3.5" />
              <span>OPTICAL MATERIAL CLASSIFIER</span>
            </div>
            <h2 className="text-2xl font-bold font-display text-white">
              Instant AI Waste Classification
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Upload an image of packaging, electronics, or kitchen items. Our computer vision model inspects geometry and polymer composition to provide local preparation and contamination rules.
            </p>

            <div className="pt-2">
              <label className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-950 font-bold text-xs cursor-pointer hover:opacity-90 transition-all shadow-lg shadow-emerald-950">
                <Upload className="w-4 h-4" />
                <span>Upload Waste Photo to Inspect</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload}
                  className="hidden" 
                />
              </label>
              <span className="text-[11px] font-mono text-gray-400 ml-3">Supports JPG, PNG, WEBP</span>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#030c08] border border-emerald-500/40 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400">SCANNER TELEMETRY:</span>
              <span className="text-emerald-400 font-bold">
                {isScanning ? 'Processing image...' : scanResult ? 'Detection Complete' : 'Awaiting Input'}
              </span>
            </div>

            {scanResult ? (
              <div className="space-y-3 pt-1">
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-700/50 space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-white">{scanResult.detectedItem.name}</span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">{scanResult.confidence}% Confidence</span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-300 block">{scanResult.detectedItem.category}</span>
                </div>

                <div className="p-2.5 rounded bg-[#04110a] border border-emerald-950 text-xs space-y-1">
                  <span className="text-gray-400 text-[10px] font-mono block">MUNICIPAL NUANCE CAVEAT:</span>
                  <p className="text-gray-300 text-[11px] leading-relaxed">{scanResult.localCaveat}</p>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-gray-500 font-mono space-y-2">
                <Recycle className="w-8 h-8 text-emerald-500/40 mx-auto animate-pulse" />
                <span>Upload a picture or browse the verified waste catalog below.</span>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Main Waste Database Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Search & Item List */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Search bar & filter pills */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search items: PET bottles, pizza box, batteries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#061810] border border-emerald-800/60 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
              {['All', 'Recyclable', 'Compostable / Organic', 'E-Waste', 'Landfill / Non-Recyclable'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    selectedCategory === cat 
                      ? 'bg-emerald-900/60 text-emerald-300 border-emerald-500/60 font-bold' 
                      : 'bg-[#04110a] text-gray-400 border-emerald-950 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* List of items */}
          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {filteredItems.map(item => {
              const isSelected = selectedItem.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-emerald-950/70 border-emerald-500/60 shadow-lg shadow-black' 
                      : 'bg-[#04110a] border-emerald-950 hover:border-emerald-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-gray-100">{item.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                      item.category === 'Recyclable'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                        : item.category === 'Compostable / Organic'
                        ? 'bg-lime-950 text-lime-300 border border-lime-700/50'
                        : item.category === 'E-Waste'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/50'
                        : 'bg-rose-950 text-rose-300 border border-rose-700/50'
                    }`}>
                      {item.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 line-clamp-1 mt-1 font-mono">
                    {item.recyclingRules}
                  </span>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: In-Depth Selected Item Inspector */}
        <div className="lg:col-span-7 glass-panel rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-emerald-950 pb-4">
            <div>
              <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                selectedItem.category === 'Recyclable' ? 'bg-emerald-950 text-emerald-300' : 'bg-lime-950 text-lime-300'
              }`}>
                {selectedItem.category}
              </span>
              <h3 className="text-xl font-bold text-white font-display mt-2">
                {selectedItem.name}
              </h3>
            </div>
            <div className="text-right font-mono text-xs text-gray-400">
              <span className="block text-[10px]">DECOMPOSITION HORIZON:</span>
              <span className="text-amber-400 font-bold">{selectedItem.biodegradationTime}</span>
            </div>
          </div>

          {/* Preparation Instructions */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-wider flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Step-by-Step Preparation Protocol:</span>
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {selectedItem.preparationInstructions.map((instruction, idx) => (
                <div key={idx} className="bg-[#04110a] p-3 rounded-lg border border-emerald-900/60 flex items-start space-x-2 text-xs">
                  <span className="font-mono text-emerald-400 font-bold shrink-0">#{idx + 1}</span>
                  <span className="text-gray-200">{instruction}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contamination Warnings */}
          <div className="bg-rose-950/30 border border-rose-900/50 p-4 rounded-xl space-y-2 text-xs">
            <span className="font-mono text-rose-300 font-bold flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Common Curbside Contaminants to Avoid:</span>
            </span>
            <ul className="space-y-1 pl-2 text-gray-300">
              {selectedItem.commonContaminants.map((contam, cIdx) => (
                <li key={cIdx} className="flex items-start space-x-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>{contam}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sustainable Alternative */}
          <div className="bg-[#030c08] border border-emerald-900/60 p-4 rounded-xl space-y-1.5 text-xs">
            <span className="font-mono text-cyan-400 font-bold block">Recommended Upstream Eco-Alternative:</span>
            <p className="text-gray-300 leading-relaxed">{selectedItem.ecoAlternative}</p>
          </div>

        </div>

      </div>

    </div>
  );
};
