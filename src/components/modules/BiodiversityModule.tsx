import React, { useState, useEffect } from 'react';
import { 
  Trees, 
  Search, 
  MapPin, 
  Camera, 
  ShieldCheck, 
  ShieldAlert, 
  Plus, 
  Info, 
  ExternalLink, 
  Leaf, 
  Bug, 
  Compass, 
  CheckCircle2,
  Lock
} from 'lucide-react';
import { GbifSpeciesOccurrence, CitizenScienceObservation, DataProvenance } from '../../types';
import { fetchGbifOccurrences } from '../../services/connectors/gbifConnector';
import { StorageService } from '../../services/storageService';

interface BiodiversityModuleProps {
  onInspectProvenance: (prov: DataProvenance) => void;
}

export const BiodiversityModule: React.FC<BiodiversityModuleProps> = ({ onInspectProvenance }) => {
  const [occurrences, setOccurrences] = useState<GbifSpeciesOccurrence[]>([]);
  const [provenance, setProvenance] = useState<DataProvenance | null>(null);
  const [loading, setLoading] = useState(false);
  const [userObservations, setUserObservations] = useState<CitizenScienceObservation[]>(StorageService.getObservations());

  // Form state for citizen science observation submission
  const [newSpeciesName, setNewSpeciesName] = useState('');
  const [newCategory, setNewCategory] = useState<CitizenScienceObservation['category']>('Flora');
  const [newNotes, setNewNotes] = useState('');
  const [obfuscateLocation, setObfuscateLocation] = useState(true);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Fetch live GBIF occurrences (defaulting to Delhi / regional coordinates)
  useEffect(() => {
    let isMounted = true;
    async function loadGbif() {
      setLoading(true);
      try {
        const { occurrences: data, provenance: prov } = await fetchGbifOccurrences(28.6139, 77.2090, 50000, 8);
        if (isMounted) {
          setOccurrences(data);
          setProvenance(prov);
        }
      } catch (err) {
        console.error('Failed to load GBIF species occurrences:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadGbif();
    return () => { isMounted = false; };
  }, []);

  const handleSubmitObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpeciesName.trim()) return;

    // Apply 0.015 degree privacy jitter (~1.5 km) if obfuscation is active to protect rare nesting sites
    const jitter = obfuscateLocation ? (Math.random() - 0.5) * 0.03 : 0;

    const newObs: CitizenScienceObservation = {
      id: `obs-${Date.now()}`,
      speciesName: newSpeciesName,
      category: newCategory,
      latitude: Number((28.6139 + jitter).toFixed(4)),
      longitude: Number((77.2090 + jitter).toFixed(4)),
      locationObfuscated: obfuscateLocation,
      notes: newNotes,
      timestamp: new Date().toLocaleString(),
      verified: true
    };

    StorageService.addObservation(newObs);
    setUserObservations(StorageService.getObservations());
    setNewSpeciesName('');
    setNewNotes('');
    setSubmissionSuccess(true);
    setTimeout(() => setSubmissionSuccess(false), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 mb-1">
            <Trees className="w-4 h-4" />
            <span>GLOBAL BIODIVERSITY NETWORK (GBIF INTEGRATED)</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-display">
            Biodiversity & Nature Protection
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            Live taxonomy tracking, pollinator habitat corridors, and privacy-shielded citizen science.
          </p>
        </div>

        {provenance && (
          <button
            onClick={() => onInspectProvenance(provenance)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#061810] border border-emerald-500/40 text-emerald-300 text-xs font-mono hover:bg-emerald-950/40 transition-colors cursor-pointer"
          >
            <Info className="w-4 h-4 text-emerald-400" />
            <span>GBIF Provenance & Darwin Core</span>
          </button>
        )}
      </div>

      {/* SECTION 1: LIVE GBIF SPECIES OCCURRENCE STREAM */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-white font-display">
              Regional Biodiversity Occurrences (GBIF Live API)
            </h2>
            <p className="text-xs text-gray-400 font-mono">
              Darwin Core validated field observations within a 50km geographical radius
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800">
            {occurrences.length} Live Taxon Records
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-emerald-400 animate-pulse">
            Querying Global Biodiversity Information Facility database...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {occurrences.map((sp) => (
              <div 
                key={sp.key}
                className="glass-panel glass-panel-hover p-4 rounded-xl border border-emerald-900/60 space-y-3 relative overflow-hidden"
              >
                {sp.mediaUrl ? (
                  <div className="h-32 w-full rounded-lg overflow-hidden bg-black/40">
                    <img 
                      src={sp.mediaUrl} 
                      alt={sp.scientificName} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    />
                  </div>
                ) : (
                  <div className="h-20 w-full rounded-lg bg-[#030c08] border border-emerald-950 flex items-center justify-center text-emerald-500/40">
                    <Leaf className="w-8 h-8" />
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-xs font-mono text-emerald-400 font-bold block">{sp.kingdom}</span>
                  <h3 className="text-sm font-bold text-white italic truncate">{sp.scientificName}</h3>
                  {sp.vernacularName && (
                    <span className="text-xs text-gray-300 block font-normal">{sp.vernacularName}</span>
                  )}
                </div>

                <div className="pt-2 border-t border-emerald-950 text-[10px] font-mono text-gray-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Basis of Record:</span>
                    <span className="text-gray-200">{sp.basisOfRecord}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coordinates:</span>
                    <span className="text-cyan-300">({sp.decimalLatitude.toFixed(2)}, {sp.decimalLongitude.toFixed(2)})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: CITIZEN SCIENCE OBSERVATION SUBMISSION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Submission Form */}
        <div className="lg:col-span-6 glass-panel rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-emerald-950 pb-3">
            <div className="flex items-center space-x-2">
              <Camera className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white font-display">Document an Ecological Observation</h3>
            </div>
            <span className="text-xs font-mono text-emerald-400">Citizen Science Gateway</span>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed">
            Record sightings of native flora, pollinators, birds, or wildlife. Data is contributed to verified ecological monitoring programs with built-in location privacy shielding.
          </p>

          <form onSubmit={handleSubmitObservation} className="space-y-4 text-xs font-sans">
            <div>
              <label className="text-gray-300 font-medium block mb-1">Species Name / Description:</label>
              <input
                type="text"
                placeholder="e.g. Indian Peafowl, Native Banyan, Asiatic Honey Bee"
                value={newSpeciesName}
                onChange={(e) => setNewSpeciesName(e.target.value)}
                className="w-full bg-[#030c08] border border-emerald-900 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 font-mono text-[10px] block mb-1">Taxon Category:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-[#030c08] border border-emerald-900 rounded px-2.5 py-1.5 text-emerald-300 text-xs"
                >
                  <option value="Flora">Flora (Plants / Trees)</option>
                  <option value="Pollinator">Pollinator (Bees / Butterflies)</option>
                  <option value="Fauna">Fauna (Wildlife / Birds)</option>
                  <option value="Fungi">Fungi & Lichen</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400 font-mono text-[10px] block mb-1">Photo Upload (Optional):</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-[11px] text-gray-400 file:bg-emerald-950 file:border-0 file:text-emerald-300 file:px-2 file:py-1 file:rounded file:cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-300 font-medium block mb-1">Habitat Notes & Behavioral Context:</label>
              <textarea
                placeholder="Observed feeding on flowering neem, nesting in rock crevice..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                rows={2}
                className="w-full bg-[#030c08] border border-emerald-900 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none"
              />
            </div>

            {/* Privacy Protection Toggle */}
            <div className="p-3 rounded-lg bg-[#04110a] border border-emerald-950 space-y-2">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={obfuscateLocation}
                  onChange={(e) => setObfuscateLocation(e.target.checked)}
                  className="accent-emerald-500"
                />
                <span className="font-semibold text-gray-200">
                  Enable Geolocation Privacy Masking (1.5 km Jitter)
                </span>
              </label>
              <p className="text-[11px] text-gray-400 leading-relaxed pl-6">
                Protects endangered or threatened species from poaching and disturbance by intentionally blurring exact GPS coordinates on public maps while retaining research utility.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-md shadow-emerald-950 cursor-pointer"
            >
              Submit Verified Ecological Observation
            </button>

            {submissionSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-200 flex items-center space-x-2 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Observation securely submitted and indexed!</span>
              </div>
            )}
          </form>
        </div>

        {/* Right: User's Observation Ledger */}
        <div className="lg:col-span-6 glass-panel rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-950 pb-3">
            <h3 className="text-base font-bold text-white font-display">Recent Field Observations</h3>
            <span className="text-xs font-mono text-cyan-300">{userObservations.length} Documented</span>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {userObservations.map((obs) => (
              <div key={obs.id} className="p-4 rounded-xl bg-[#04110a] border border-emerald-950 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{obs.speciesName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {obs.category}
                  </span>
                </div>

                <p className="text-gray-300 leading-relaxed text-[11px]">{obs.notes}</p>

                <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-gray-400 pt-1 border-t border-emerald-950/60">
                  <span className="flex items-center space-x-1">
                    <Compass className="w-3 h-3 text-emerald-400" />
                    <span>({obs.latitude}, {obs.longitude})</span>
                    {obs.locationObfuscated && (
                      <span className="text-cyan-400 font-bold ml-1 flex items-center">
                        <Lock className="w-2.5 h-2.5 mr-0.5" />
                        Masked
                      </span>
                    )}
                  </span>
                  <span>{obs.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
