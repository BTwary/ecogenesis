import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Award, 
  Sparkles, 
  Share2, 
  ShieldCheck, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CommunityInitiative, PersonaType } from '../../types';
import { StorageService } from '../../services/storageService';

interface CommunityNetworkModuleProps {
  activePersona: PersonaType;
}

export const CommunityNetworkModule: React.FC<CommunityNetworkModuleProps> = ({ activePersona }) => {
  const [initiatives, setInitiatives] = useState<CommunityInitiative[]>(StorageService.getInitiatives());
  
  // Launch Initiative Modal/Form
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newOrg, setNewOrg] = useState('');
  const [newCategory, setNewCategory] = useState('Reforestation & Biodiversity');
  const [newLocation, setNewLocation] = useState('Delhi NCR, India');
  const [newTarget, setNewTarget] = useState(200);
  const [newImpact, setNewImpact] = useState('');
  
  const [joinedToast, setJoinedToast] = useState<string | null>(null);

  const handleJoin = (initTitle: string) => {
    confetti({
      particleCount: 70,
      spread: 50,
      origin: { y: 0.7 }
    });
    setJoinedToast(`You have successfully joined "${initTitle}"!`);
    setTimeout(() => setJoinedToast(null), 3500);
  };

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newInit: CommunityInitiative = {
      id: `init-${Date.now()}`,
      title: newTitle,
      organization: newOrg || 'Community Alliance Member',
      category: newCategory,
      participants: 1,
      targetParticipants: newTarget,
      verifiedImpact: newImpact || 'Pledged citizen collective action',
      status: 'Open',
      location: newLocation,
      startDate: new Date().toISOString().slice(0, 10)
    };

    StorageService.addInitiative(newInit);
    setInitiatives(StorageService.getInitiatives());
    setShowLaunchModal(false);
    setNewTitle('');
    setNewImpact('');

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.5 }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* Toast Notification */}
      {joinedToast && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-950 border border-emerald-500 text-emerald-200 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-mono">{joinedToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 mb-1">
            <Users className="w-4 h-4" />
            <span>COLLECTIVE STEWARDSHIP NETWORK</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-display">
            Community Sustainability Network
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            Coordinate student campaigns, corporate volunteering, municipal cleanups, and local tree drives.
          </p>
        </div>

        <button
          onClick={() => setShowLaunchModal(true)}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-gray-950 font-bold text-xs tracking-wide transition-all shadow-lg shadow-emerald-950 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-gray-950" />
          <span>Launch New Initiative</span>
        </button>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl text-center space-y-1">
          <span className="text-xs font-mono text-gray-400">ACTIVE INITIATIVES</span>
          <div className="text-3xl font-extrabold text-emerald-400 font-display">
            {initiatives.length}
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl text-center space-y-1">
          <span className="text-xs font-mono text-gray-400">ACTIVE VOLUNTEERS</span>
          <div className="text-3xl font-extrabold text-cyan-400 font-display">
            {initiatives.reduce((acc, i) => acc + i.participants, 0).toLocaleString()}
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl text-center space-y-1">
          <span className="text-xs font-mono text-gray-400">VERIFICATION RATE</span>
          <div className="text-3xl font-extrabold text-amber-400 font-display">
            100%
          </div>
        </div>
      </div>

      {/* Initiatives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initiatives.map((init) => {
          const progressPercent = Math.min(100, Math.round((init.participants / init.targetParticipants) * 100));

          return (
            <div 
              key={init.id}
              className="glass-panel rounded-xl p-6 space-y-4 border border-emerald-900/60 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                    {init.category}
                  </span>
                  <span className="text-[11px] font-mono text-cyan-400">
                    {init.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white font-display leading-snug">
                  {init.title}
                </h3>

                <span className="text-xs text-gray-400 block font-medium">
                  Organized by: <strong className="text-gray-200">{init.organization}</strong>
                </span>

                <div className="flex items-center space-x-3 text-xs text-gray-400 font-mono">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{init.location}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{init.startDate}</span>
                  </span>
                </div>

                {/* Progress */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-xs font-mono text-gray-300">
                    <span>Participation:</span>
                    <span className="text-emerald-400 font-bold">{init.participants} / {init.targetParticipants}</span>
                  </div>
                  <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-1.5 rounded-full" 
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Verified Outcome Banner */}
                <div className="p-3 rounded-lg bg-[#030c08] border border-emerald-950 text-xs text-gray-300 space-y-1">
                  <span className="text-[10px] font-mono text-cyan-400 block font-bold">VERIFIED DELIVERABLE:</span>
                  <p className="text-[11px] leading-relaxed text-emerald-200/90">{init.verifiedImpact}</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleJoin(init.title)}
                  className="w-full py-2.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-300 font-semibold text-xs tracking-wide transition-all cursor-pointer shadow-md"
                >
                  Join & Sign Up as Volunteer →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Launch Initiative Modal */}
      {showLaunchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#061810] border border-emerald-500/40 rounded-xl p-6 shadow-2xl space-y-5 text-gray-200 font-sans">
            <h3 className="text-lg font-bold text-white font-display">Launch a Community Initiative</h3>
            
            <form onSubmit={handleLaunch} className="space-y-3.5 text-xs">
              <div>
                <label className="text-gray-300 block mb-1">Initiative Title:</label>
                <input
                  type="text"
                  placeholder="e.g. Neighbourhood Miyawaki Forest Planting"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#030c08] border border-emerald-900 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-300 block mb-1">Organizing Entity:</label>
                  <input
                    type="text"
                    placeholder="e.g. EcoClub, GreenWing Trust"
                    value={newOrg}
                    onChange={(e) => setNewOrg(e.target.value)}
                    className="w-full bg-[#030c08] border border-emerald-900 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-300 block mb-1">Category:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#030c08] border border-emerald-900 rounded-lg px-2.5 py-2 text-emerald-300"
                  >
                    <option value="Reforestation & Biodiversity">Reforestation & Biodiversity</option>
                    <option value="Water & Wetland Restoration">Water & Wetland Restoration</option>
                    <option value="Plastic Cleanup & Circularity">Plastic Cleanup & Circularity</option>
                    <option value="Renewable Energy Co-op">Renewable Energy Co-op</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-300 block mb-1">Location / City:</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-[#030c08] border border-emerald-900 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-300 block mb-1">Target Participants:</label>
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    value={newTarget}
                    onChange={(e) => setNewTarget(Number(e.target.value))}
                    className="w-full bg-[#030c08] border border-emerald-900 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-300 block mb-1">Target Measurable Outcome / Deliverable:</label>
                <input
                  type="text"
                  placeholder="e.g. 500 native saplings planted, 2 km wetland cleaned"
                  value={newImpact}
                  onChange={(e) => setNewImpact(e.target.value)}
                  className="w-full bg-[#030c08] border border-emerald-900 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-emerald-950">
                <button
                  type="button"
                  onClick={() => setShowLaunchModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#04110a] text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold"
                >
                  Publish Initiative
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
