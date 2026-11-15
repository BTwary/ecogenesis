import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
  MapPin, 
  Filter, 
  Trees, 
  Sun, 
  Droplet, 
  Trash2, 
  ExternalLink, 
  ShieldCheck, 
  Layers,
  CheckCircle2
} from 'lucide-react';
import { MapProject } from '../../types';

export const VERIFIED_GLOBAL_PROJECTS: MapProject[] = [
  {
    id: 'proj-1',
    name: 'Bhadla Solar Park Photovoltaic Complex',
    category: 'renewable',
    latitude: 27.5387,
    longitude: 71.9189,
    description: 'One of the world’s largest operational solar installations (2,245 MWp capacity) spanning over 14,000 acres in the Thar Desert.',
    status: 'operational',
    impactMetric: 'Generates ~4.5 Billion kWh of zero-carbon power annually, displacing 3.2 Mt CO2e.',
    verifiedOrganization: 'Rajasthan Solar Park Development Company / NTPC',
    sourceUrl: 'https://energy.rajasthan.gov.in'
  },
  {
    id: 'proj-2',
    name: 'Sundarbans Mangrove Climate Biosphere Restoration',
    category: 'reforestation',
    latitude: 21.9497,
    longitude: 89.1833,
    description: 'Restoration of resilient mangrove fringes (Rhizophora & Avicennia) serving as a biological cyclonic buffer and high-density blue carbon sink.',
    status: 'active',
    impactMetric: 'Over 14,000 hectares restored; absorbs ~4x more carbon per hectare than terrestrial tropical forests.',
    verifiedOrganization: 'West Bengal Forest Department & Nature Environment and Wildlife Society',
    sourceUrl: 'https://forest.wb.gov.in'
  },
  {
    id: 'proj-3',
    name: 'Great Green Wall of Africa',
    category: 'reforestation',
    latitude: 14.4974,
    longitude: 14.4524,
    description: 'An ambitious 8,000 km natural belt across the Sahel from Senegal to Djibouti combating desertification, soil erosion, and climate migration.',
    status: 'in_progress',
    impactMetric: 'Over 18 million hectares of degraded land restored; target of 100M hectares by 2030.',
    verifiedOrganization: 'African Union & UNCCD Global Mechanism',
    sourceUrl: 'https://www.greatgreenwall.org'
  },
  {
    id: 'proj-4',
    name: 'Yamuna River Catchment & Plastic Interceptor Hub',
    category: 'cleanup',
    latitude: 28.6692,
    longitude: 77.2315,
    description: 'Automated floating booms and citizen volunteer sorting depots intercepting municipal plastic flotsam before it reaches major downstream tributaries.',
    status: 'active',
    impactMetric: 'Diverts an average of 420 tonnes of low-density packaging polymer annually.',
    verifiedOrganization: 'National Mission for Clean Ganga (NMCG) & Local Civic Alliances',
    sourceUrl: 'https://nmcg.nic.in'
  },
  {
    id: 'proj-5',
    name: 'Hornsea Offshore Wind Farm Complex',
    category: 'renewable',
    latitude: 53.8833,
    longitude: 1.8333,
    description: 'Gigawatt-scale offshore wind facility located in the North Sea utilizing 8 MW and 14 MW direct-drive marine turbines.',
    status: 'operational',
    impactMetric: 'Supplies clean electricity to over 2.5 million homes annually.',
    verifiedOrganization: 'Ørsted UK Clean Power',
    sourceUrl: 'https://orsted.co.uk'
  },
  {
    id: 'proj-6',
    name: 'Al-Baydha Regenerative Watershed Restoration',
    category: 'water_restoration',
    latitude: 21.2854,
    longitude: 39.2376,
    description: 'Arid land permaculture and check-dam hydrology utilizing flash-flood capture to restore perennial vegetation in hyper-arid desert terrain.',
    status: 'active',
    impactMetric: 'Over 1.2 billion litres of flood runoff retained annually, recharging regional aquifers.',
    verifiedOrganization: 'King Abdulaziz University & Al-Baydha Project Association',
    sourceUrl: 'https://albaydha.org'
  }
];

export const GlobalActionMapModule: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeProject, setActiveProject] = useState<MapProject>(VERIFIED_GLOBAL_PROJECTS[0]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const filteredProjects = VERIFIED_GLOBAL_PROJECTS.filter(p => {
    return selectedCategory === 'all' || p.category === selectedCategory;
  });

  // Initialize or update Leaflet map
  useEffect(() => {
    let L: any = (window as any).L;

    if (!mapContainerRef.current) return;

    if (!L) {
      // If Leaflet not loaded from CDN yet, dynamically load
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.onload = () => initMap((window as any).L);
      document.head.appendChild(script);
    } else {
      initMap(L);
    }

    function initMap(leafletInstance: any) {
      if (!leafletInstance || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        // Initialize map with dark tiles
        const map = leafletInstance.map(mapContainerRef.current).setView([25.0, 50.0], 3);
        
        // CartoDB Dark Matter tile layer for futuristic aesthetic
        leafletInstance.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap contributors',
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;

      // Clear existing markers
      if ((map as any)._markersGroup) {
        map.removeLayer((map as any)._markersGroup);
      }

      const markersGroup = leafletInstance.layerGroup();

      filteredProjects.forEach(proj => {
        // Create custom futuristic pulsing marker icon
        const iconHtml = `
          <div style="
            width: 22px; 
            height: 22px; 
            border-radius: 50%; 
            background: #10b981; 
            border: 2px solid #ffffff; 
            box-shadow: 0 0 14px #00ff88;
            cursor: pointer;
          "></div>
        `;

        const customIcon = leafletInstance.divIcon({
          html: iconHtml,
          className: 'custom-map-marker',
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        const marker = leafletInstance.marker([proj.latitude, proj.longitude], { icon: customIcon });
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
            <strong style="color: #34d399; font-size: 13px;">${proj.name}</strong><br/>
            <span style="color: #9ca3af; font-size: 10px; font-family: monospace;">Category: ${proj.category.toUpperCase()}</span>
            <p style="margin: 6px 0; color: #e5e7eb;">${proj.description}</p>
            <div style="color: #38bdf8; font-size: 11px; font-family: monospace;">${proj.impactMetric}</div>
          </div>
        `);

        marker.on('click', () => {
          setActiveProject(proj);
        });

        markersGroup.addLayer(marker);
      });

      markersGroup.addTo(map);
      (map as any)._markersGroup = markersGroup;
    }
  }, [filteredProjects]);

  const handleFlyTo = (proj: MapProject) => {
    setActiveProject(proj);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([proj.latitude, proj.longitude], 6, {
        duration: 1.5
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 mb-1">
            <Compass className="w-4 h-4" />
            <span>GLOBAL ACTION GEOSPATIAL MAP</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-display">
            Global Environmental Action & Restoration Map
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            Interactive mapping of verified reforestation, renewable complexes, watersheds, and cleanups.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 text-xs font-mono">
          {[
            { id: 'all', label: 'All Projects' },
            { id: 'reforestation', label: 'Reforestation' },
            { id: 'renewable', label: 'Renewable Power' },
            { id: 'water_restoration', label: 'Water Basins' },
            { id: 'cleanup', label: 'Plastic Interceptors' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedCategory(f.id)}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                selectedCategory === f.id
                  ? 'bg-emerald-900/70 text-emerald-300 border-emerald-500/60 font-bold'
                  : 'bg-[#04110a] text-gray-400 border-emerald-950 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Container & Active Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive Leaflet Map Canvas */}
        <div className="lg:col-span-8 glass-panel rounded-2xl overflow-hidden p-1.5 border border-emerald-500/30 shadow-2xl relative">
          <div 
            ref={mapContainerRef} 
            className="w-full h-[520px] rounded-xl z-10"
            style={{ background: '#030c08' }}
          ></div>

          <div className="absolute bottom-4 left-4 z-20 bg-[#061810]/90 backdrop-blur border border-emerald-500/30 px-3 py-1.5 rounded-lg text-[11px] font-mono text-emerald-300 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{filteredProjects.length} Verified Field Locations Mapped</span>
          </div>
        </div>

        {/* Right: Selected Project Dossier */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-6 space-y-5 border border-emerald-500/30 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-950 pb-3">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                {activeProject.category.replace(/_/g, ' ')}
              </span>
              <span className="text-xs font-mono text-cyan-300 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Entity</span>
              </span>
            </div>

            <h3 className="text-xl font-bold text-white font-display leading-tight">
              {activeProject.name}
            </h3>

            <p className="text-xs text-gray-300 leading-relaxed">
              {activeProject.description}
            </p>

            <div className="p-3.5 rounded-xl bg-[#030c08] border border-emerald-900/60 text-xs space-y-2">
              <span className="font-mono text-cyan-400 font-bold block text-[11px]">VERIFIED ENVIRONMENTAL OUTCOME:</span>
              <p className="text-emerald-300 font-mono text-xs leading-relaxed">{activeProject.impactMetric}</p>
            </div>

            <div className="space-y-1 text-xs text-gray-400 font-mono">
              <div className="flex justify-between">
                <span>Coordinates:</span>
                <span className="text-gray-200">({activeProject.latitude.toFixed(2)}, {activeProject.longitude.toFixed(2)})</span>
              </div>
              <div className="flex justify-between">
                <span>Operating Authority:</span>
                <span className="text-gray-200">{activeProject.verifiedOrganization}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-emerald-950 space-y-2">
            <a
              href={activeProject.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-600/40 text-emerald-300 text-xs font-mono flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <span>Visit Official Project Registry</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>

      {/* Directory of Map Points */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white font-display">Directory of Verified Geospatial Points</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              onClick={() => handleFlyTo(p)}
              className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                activeProject.id === p.id 
                  ? 'bg-emerald-950/80 border-emerald-500/60 shadow-md' 
                  : 'bg-[#04110a] border-emerald-950 hover:border-emerald-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white truncate">{p.name}</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">
                  {p.category}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 line-clamp-2 mt-1">{p.description}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
