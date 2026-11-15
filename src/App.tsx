import React, { useState } from 'react';
import { TelemetryTicker } from './components/layout/TelemetryTicker';
import { Navbar } from './components/layout/Navbar';
import { ProvenanceModal } from './components/layout/ProvenanceModal';
import { IntegrationReportModal } from './components/layout/IntegrationReportModal';

import { HomeModule } from './components/modules/HomeModule';
import { DashboardModule } from './components/modules/DashboardModule';
import { AiAssistantModule } from './components/modules/AiAssistantModule';
import { FootprintCalculatorModule } from './components/modules/FootprintCalculatorModule';
import { SustainablePlannerModule } from './components/modules/SustainablePlannerModule';
import { WasteManagementModule } from './components/modules/WasteManagementModule';
import { WaterIntelligenceModule } from './components/modules/WaterIntelligenceModule';
import { RenewableExplorerModule } from './components/modules/RenewableExplorerModule';
import { BiodiversityModule } from './components/modules/BiodiversityModule';
import { GlobalActionMapModule } from './components/modules/GlobalActionMapModule';
import { CommunityNetworkModule } from './components/modules/CommunityNetworkModule';
import { ReportingModule } from './components/modules/ReportingModule';

import { PersonaType, DataProvenance, DataSourceProvider } from './types';
import { DATA_SOURCE_REGISTRY, createProvenanceRecord } from './services/connectors/dataProvenanceRegistry';
import { StorageService } from './services/storageService';
import { Leaf, ShieldCheck, Database, Globe2 } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [activePersona, setActivePersona] = useState<PersonaType>(StorageService.getPersona());
  const [inspectingProvenance, setInspectingProvenance] = useState<DataProvenance | null>(null);
  const [showIntegrationReport, setShowIntegrationReport] = useState<boolean>(false);

  const handleSetPersona = (p: PersonaType) => {
    setActivePersona(p);
    StorageService.setPersona(p);
  };

  const handleOpenProviderProvenance = (providerName: string) => {
    const prov = createProvenanceRecord(
      providerName as DataSourceProvider,
      'REGISTRY-INSPECTION-SNAPSHOT',
      'Global / Regional Station',
      'Multi-Parameter Environmental Telemetry',
      'Normalized SI Units',
      'Standard Metrics',
      'Direct satellite assimilation and in-situ sensor telemetry stream',
      'VERIFIED_LIVE'
    );
    setInspectingProvenance(prov);
  };

  return (
    <div className="min-h-screen bg-[#030c08] text-[#f2f9f5] flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* 1. Global Telemetry Ribbon */}
      <TelemetryTicker onOpenProvenance={handleOpenProviderProvenance} />

      {/* 2. Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activePersona={activePersona}
        setActivePersona={handleSetPersona}
        onOpenIntegrationReport={() => setShowIntegrationReport(true)}
      />

      {/* 3. Main Active View Router */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeModule
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenProvenance={handleOpenProviderProvenance}
            onInspectProvenance={(prov) => setInspectingProvenance(prov)}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardModule
            onInspectProvenance={(prov) => setInspectingProvenance(prov)}
          />
        )}

        {activeTab === 'assistant' && (
          <AiAssistantModule />
        )}

        {activeTab === 'footprint' && (
          <FootprintCalculatorModule
            activePersona={activePersona}
            onInspectProvenance={(prov) => setInspectingProvenance(prov)}
            onNavigateToPlanner={() => setActiveTab('planner')}
          />
        )}

        {activeTab === 'planner' && (
          <SustainablePlannerModule />
        )}

        {activeTab === 'waste' && (
          <WasteManagementModule />
        )}

        {activeTab === 'water' && (
          <WaterIntelligenceModule
            onInspectProvenance={(prov) => setInspectingProvenance(prov)}
          />
        )}

        {activeTab === 'renewable' && (
          <RenewableExplorerModule
            onInspectProvenance={(prov) => setInspectingProvenance(prov)}
          />
        )}

        {activeTab === 'biodiversity' && (
          <BiodiversityModule
            onInspectProvenance={(prov) => setInspectingProvenance(prov)}
          />
        )}

        {activeTab === 'map' && (
          <GlobalActionMapModule />
        )}

        {activeTab === 'community' && (
          <CommunityNetworkModule
            activePersona={activePersona}
          />
        )}

        {activeTab === 'reports' && (
          <ReportingModule
            activePersona={activePersona}
          />
        )}
      </main>

      {/* 4. Footer */}
      <footer className="bg-[#020a06] border-t border-emerald-950 py-12 px-4 sm:px-6 lg:px-8 text-xs text-gray-400 font-sans">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Leaf className="w-5 h-5 text-emerald-400" />
                <span className="text-base font-extrabold text-white font-display">
                  ECO<span className="text-emerald-400">GENESIS</span>
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                An integrated environmental intelligence platform transforming sustainability into measurable, scientifically verified action.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono text-emerald-400 font-bold block uppercase">
                Core Modules
              </span>
              <ul className="space-y-1 text-xs">
                <li><button onClick={() => setActiveTab('dashboard')} className="hover:text-emerald-300">Intelligence Dashboard</button></li>
                <li><button onClick={() => setActiveTab('assistant')} className="hover:text-emerald-300">AI Sustainability Assistant</button></li>
                <li><button onClick={() => setActiveTab('footprint')} className="hover:text-emerald-300">Carbon Footprint Calculator</button></li>
                <li><button onClick={() => setActiveTab('planner')} className="hover:text-emerald-300">Sustainable Living Planner</button></li>
                <li><button onClick={() => setActiveTab('waste')} className="hover:text-emerald-300">Smart Waste Management</button></li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono text-emerald-400 font-bold block uppercase">
                Resource Domains
              </span>
              <ul className="space-y-1 text-xs">
                <li><button onClick={() => setActiveTab('water')} className="hover:text-emerald-300">Water Conservation</button></li>
                <li><button onClick={() => setActiveTab('renewable')} className="hover:text-emerald-300">Renewable Energy Simulator</button></li>
                <li><button onClick={() => setActiveTab('biodiversity')} className="hover:text-emerald-300">Biodiversity & GBIF Records</button></li>
                <li><button onClick={() => setActiveTab('map')} className="hover:text-emerald-300">Global Action Map</button></li>
                <li><button onClick={() => setActiveTab('reports')} className="hover:text-emerald-300">Executive ESG Reports</button></li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-mono text-emerald-400 font-bold block uppercase">
                Scientific Verification
              </span>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Connectors operational with Open-Meteo, NASA POWER, GBIF, CPCB India, Copernicus CAMS, GFW, and NWIC.
              </p>
              <button
                onClick={() => setShowIntegrationReport(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-600/40 text-emerald-300 text-xs font-mono hover:bg-emerald-900/60 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>View Integration Audit Report</span>
              </button>
            </div>

          </div>

          <div className="pt-8 border-t border-emerald-950/60 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-gray-400 gap-4">
            <div>
              &copy; {new Date().getFullYear()} ECOGENESIS Ecosystem. Built for planetary responsibility.
            </div>
            <div className="flex items-center space-x-4">
              <span>MAKE SUSTAINABILITY MEASURABLE</span>
              <span>•</span>
              <span>MAKE ACTION ACCESSIBLE</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 5. Modals */}
      <ProvenanceModal
        provenance={inspectingProvenance}
        onClose={() => setInspectingProvenance(null)}
      />

      {showIntegrationReport && (
        <IntegrationReportModal
          onClose={() => setShowIntegrationReport(false)}
        />
      )}

    </div>
  );
}

export default App;
