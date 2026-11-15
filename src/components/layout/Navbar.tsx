import React, { useState } from 'react';
import { 
  Globe2, 
  Cpu, 
  Leaf, 
  BarChart3, 
  Compass, 
  Droplet, 
  Trash2, 
  Sun, 
  Trees, 
  Users, 
  FileText, 
  Menu, 
  X, 
  Layers, 
  CheckCircle2, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { PersonaType } from '../../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activePersona: PersonaType;
  setActivePersona: (p: PersonaType) => void;
  onOpenIntegrationReport: () => void;
}

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Globe2 },
  { id: 'dashboard', label: 'Intelligence Dashboard', icon: BarChart3 },
  { id: 'assistant', label: 'AI Assistant', icon: Sparkles },
  { id: 'footprint', label: 'My Footprint', icon: Leaf },
  { id: 'planner', label: 'Sustainable Living', icon: CheckCircle2 },
  { id: 'waste', label: 'Waste Management', icon: Trash2 },
  { id: 'water', label: 'Water Conservation', icon: Droplet },
  { id: 'renewable', label: 'Renewable Energy', icon: Sun },
  { id: 'biodiversity', label: 'Biodiversity', icon: Trees },
  { id: 'map', label: 'Global Action Map', icon: Compass },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'reports', label: 'Reports', icon: FileText },
];

const PERSONA_LABELS: Record<PersonaType, { label: string; icon: string; badge: string }> = {
  individual: { label: 'Individual Citizen', icon: '👤', badge: 'Standard Mode' },
  household: { label: 'Household / Family', icon: '🏡', badge: 'Multi-User Unit' },
  school: { label: 'Educational Institution', icon: '🎓', badge: 'Campus & Student Teams' },
  business: { label: 'Business / Enterprise', icon: '🏢', badge: 'Scope 1, 2, 3 ESG' },
  ngo: { label: 'Environmental Org', icon: '🌱', badge: 'Conservation Steward' },
  community_admin: { label: 'Community Admin', icon: '🏛️', badge: 'Municipal Oversight' },
};

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activePersona,
  setActivePersona,
  onOpenIntegrationReport
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#04110a]/90 backdrop-blur-xl border-b border-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-800 to-[#04110a] border border-emerald-400/30 shadow-lg shadow-emerald-950/60">
              <Leaf className="w-5 h-5 text-emerald-300 transform -rotate-12" />
              <div className="absolute inset-0 rounded-xl ring-1 ring-emerald-400/40 animate-pulse-slow"></div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-extrabold tracking-wider text-white font-display">
                  ECO<span className="text-emerald-400">GENESIS</span>
                </span>
                <span className="text-[9px] font-mono font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-600/40 px-1.5 py-0.5 rounded">
                  v2.4 AI-OS
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-mono tracking-tight hidden sm:block">
                Planetary Environmental Intelligence Ecosystem
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1">
            {NAV_ITEMS.slice(0, 7).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-950'
                      : 'text-gray-300 hover:text-emerald-200 hover:bg-emerald-950/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* More Menu Dropdown for remaining modules */}
            <div className="relative group">
              <button className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-emerald-200 hover:bg-emerald-950/40 transition-colors cursor-pointer">
                <span>More</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <div className="absolute right-0 mt-1 w-52 bg-[#061810] border border-emerald-500/30 rounded-lg shadow-xl shadow-black p-1.5 hidden group-hover:block transition-all z-50">
                {NAV_ITEMS.slice(7).map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-xs font-medium text-left transition-colors cursor-pointer ${
                        isActive 
                          ? 'bg-emerald-900/60 text-emerald-300 font-semibold' 
                          : 'text-gray-300 hover:text-white hover:bg-emerald-900/30'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Right Header Utilities: Persona Switcher & Integration Report */}
          <div className="hidden sm:flex items-center space-x-3">
            
            {/* Persona Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
                className="flex items-center space-x-2 bg-[#061a11] border border-emerald-500/30 hover:border-emerald-400/50 px-2.5 py-1.5 rounded-lg text-xs text-emerald-300 transition-all cursor-pointer"
              >
                <span>{PERSONA_LABELS[activePersona].icon}</span>
                <span className="font-medium hidden md:inline">{PERSONA_LABELS[activePersona].label}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {personaDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#061810] border border-emerald-500/40 rounded-xl shadow-2xl shadow-black p-2 z-50 animate-fade-in font-sans">
                  <div className="px-3 py-2 text-[11px] font-mono text-gray-400 border-b border-emerald-950 uppercase tracking-wider">
                    Select Account Context
                  </div>
                  <div className="space-y-1 mt-1">
                    {(Object.keys(PERSONA_LABELS) as PersonaType[]).map((pKey) => {
                      const p = PERSONA_LABELS[pKey];
                      const isSelected = activePersona === pKey;
                      return (
                        <button
                          key={pKey}
                          onClick={() => {
                            setActivePersona(pKey);
                            setPersonaDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                            isSelected 
                              ? 'bg-emerald-900/50 text-emerald-300 font-semibold border border-emerald-600/30' 
                              : 'text-gray-300 hover:bg-emerald-950/60 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span>{p.icon}</span>
                            <span>{p.label}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono">{p.badge}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Integration Report Button */}
            <button
              onClick={onOpenIntegrationReport}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50 hover:text-emerald-200 transition-all cursor-pointer shadow-sm"
              title="Click to view Source-by-Source Environmental Data Ingestion & Integration Audit Report"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden lg:inline">Data Connectors</span>
              <span className="lg:hidden">Data</span>
            </button>

          </div>

          {/* Mobile Menu Button */}
          <div className="flex xl:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-emerald-900/40 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#04110a] border-b border-emerald-500/20 px-4 pt-2 pb-6 space-y-3 font-sans">
          
          <div className="pt-2 pb-1 border-b border-emerald-950 flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400">Account Persona:</span>
            <select
              value={activePersona}
              onChange={(e) => setActivePersona(e.target.value as PersonaType)}
              className="bg-[#061810] border border-emerald-700/50 text-emerald-300 text-xs rounded px-2 py-1"
            >
              {(Object.keys(PERSONA_LABELS) as PersonaType[]).map((k) => (
                <option key={k} value={k}>{PERSONA_LABELS[k].label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 px-3 py-2.5 rounded-lg text-xs font-medium text-left ${
                    isActive 
                      ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40' 
                      : 'text-gray-300 hover:bg-emerald-950/50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-emerald-950">
            <button
              onClick={() => {
                onOpenIntegrationReport();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg bg-emerald-950 border border-emerald-600/50 text-emerald-300 text-xs font-mono"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>View Data Ingestion Audit Report (8/8)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
