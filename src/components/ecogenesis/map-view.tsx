"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type * as LTypes from "leaflet";
import { Bird, Map as MapIcon, MousePointerClick, Radar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard, DataBadge, SourcePanel, IntegrityNote, EmptyState, type DataKind } from "./ui-kit";
import { api, useAsync, fmtNum, timeAgo } from "@/lib/client";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  lat: number;
  lng: number;
  placeName: string;
  orgName: string | null;
  impactClaim: string | null;
  verification: string;
  isDemo: boolean;
  sourceNote: string | null;
  createdAt: string;
  participantCount: number;
  joined: boolean;
  commentCount: number;
}

interface ProjectsResponse {
  projects: Project[];
}

interface AirParam {
  value: number;
  observedAt: string;
  stale: boolean;
}

interface AirResponse {
  latest: Record<string, AirParam | null>;
  provenance: { providerName: string; retrievedAt: string; cached: boolean; notes?: string; warning?: string };
}

interface BioResponse {
  location: { lat: number; lng: number };
  radiusKm: number;
  totalCount: number;
  sampledRecords: number;
  speciesCounts: { species: string; count: number; kingdom: string }[];
  analytics: { methodology: string; limitations: string[]; confidence: string };
  provenance: { providerName: string; retrievedAt: string };
}

/* ------------------------------------------------------------------ */
/* Constants + helpers                                                 */
/* ------------------------------------------------------------------ */

const CATEGORIES: { value: string; label: string }[] = [
  { value: "restoration", label: "Restoration" },
  { value: "tree-planting", label: "Tree planting" },
  { value: "recycling", label: "Recycling" },
  { value: "renewable", label: "Renewable" },
  { value: "cleanup", label: "Clean-up" },
  { value: "biodiversity", label: "Biodiversity" },
  { value: "water", label: "Water" },
  { value: "education", label: "Education" },
];

const STATUSES: { value: string; label: string }[] = [
  { value: "planned", label: "Planned" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

const CATEGORY_COLORS: Record<string, string> = {
  restoration: "#34d399",
  "tree-planting": "#4ade80",
  recycling: "#fbbf24",
  renewable: "#a3e635",
  cleanup: "#38bdf8",
  biodiversity: "#c084fc",
  water: "#22d3ee",
  education: "#94a3b8",
};

const FALLBACK_COLOR = "#94a3b8";

function catColor(category: string): string {
  return CATEGORY_COLORS[category] ?? FALLBACK_COLOR;
}

function esc(s: string | null | undefined): string {
  return (s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function round6(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

function buildPopup(p: Project): string {
  const verificationText = p.isDemo
    ? "Demonstration data (not verified)"
    : p.verification === "verified"
      ? "Verified"
      : "Self-reported — awaiting evidence review";
  return [
    `<div class="max-w-60 space-y-1 text-xs leading-relaxed">`,
    `<strong class="text-sm">${esc(p.title)}</strong>`,
    `<div>${esc(p.category)} · ${esc(p.status)}</div>`,
    p.placeName ? `<div>${esc(p.placeName)}</div>` : "",
    `<div>Verification: ${esc(verificationText)}</div>`,
    p.impactClaim ? `<div>Impact claim: ${esc(p.impactClaim)}</div>` : "",
    p.isDemo ? `<div><strong>DEMO DATA</strong> — demonstration entry, not a real project</div>` : "",
    `</div>`,
  ]
    .filter(Boolean)
    .join("");
}

/* ------------------------------------------------------------------ */
/* View                                                                */
/* ------------------------------------------------------------------ */

export default function MapView() {
  /* Leaflet instance refs (guarded against StrictMode double-init) */
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LTypes.Map | null>(null);
  const layerRef = useRef<LTypes.LayerGroup | null>(null);
  const markersRef = useRef<Map<string, LTypes.CircleMarker>>(new Map());
  const leafletRef = useRef<typeof LTypes | null>(null);
  const initRef = useRef(false);
  const [ready, setReady] = useState(false);

  /* Filters */
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [params, setParams] = useState("");

  const projects = useAsync<ProjectsResponse>(() => api(`/api/projects${params}`), [params]);

  /* Debounced filter → query-string param state (used as useAsync dep) */
  useEffect(() => {
    const sp = new URLSearchParams();
    if (category !== "all") sp.set("category", category);
    if (status !== "all") sp.set("status", status);
    if (q.trim()) sp.set("q", q.trim());
    const s = sp.toString();
    const t = setTimeout(() => setParams(s ? `?${s}` : ""), 300);
    return () => clearTimeout(t);
  }, [category, status, q]);

  /* Point lookup */
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [scan, setScan] = useState(false);

  const air = useAsync<AirResponse | null>(async () => {
    if (!point) return null;
    return api<AirResponse>(`/api/env/air?lat=${point.lat}&lng=${point.lng}`);
  }, [point?.lat, point?.lng]);

  const bio = useAsync<BioResponse | null>(async () => {
    if (!scan || !point) return null;
    return api<BioResponse>(`/api/env/biodiversity?lat=${point.lat}&lng=${point.lng}&radiusKm=10`);
  }, [scan, point?.lat, point?.lng]);

  /* Map lifecycle: create once, destroy on unmount */
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || initRef.current || !containerRef.current) return;
      initRef.current = true;
      leafletRef.current = L;
      const map = L.map(containerRef.current, { center: [22, 78], zoom: 5 });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);
      const layer = L.layerGroup().addTo(map);
      mapRef.current = map;
      layerRef.current = layer;
      map.on("click", (e: LTypes.LeafletMouseEvent) => {
        setPoint({ lat: round6(e.latlng.lat), lng: round6(e.latlng.lng) });
        setScan(false);
      });
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
      initRef.current = false;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
      markersRef.current.clear();
      leafletRef.current = null;
    };
  }, []);

  /* Redraw markers whenever project data changes */
  useEffect(() => {
    const L = leafletRef.current;
    const layer = layerRef.current;
    if (!ready || !L || !layer) return;
    layer.clearLayers();
    markersRef.current.clear();
    for (const p of projects.data?.projects ?? []) {
      const color = catColor(p.category);
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 7,
        color,
        fillColor: color,
        fillOpacity: 0.85,
        weight: 1.5,
      });
      marker.bindPopup(buildPopup(p));
      marker.addTo(layer);
      markersRef.current.set(p.id, marker);
    }
  }, [projects.data, ready]);

  function focusProject(p: Project) {
    const map = mapRef.current;
    if (!map) return;
    map.setView([p.lat, p.lng], 12);
    markersRef.current.get(p.id)?.openPopup();
  }

  const airBadge: DataKind = air.data?.provenance.cached ? "cached" : "live";
  const pm25 = air.data?.latest.pm2_5 ?? null;
  const usAqi = air.data?.latest.us_aqi ?? null;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6">
      {/* ------------------------------ HEADER ------------------------------ */}
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          <MapIcon className="h-4 w-4" />
          Global action map
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Environmental action, plotted on the real world</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Community projects and clearly-marked demonstration entries on one OpenStreetMap base layer, with
          point-based environmental lookups powered by the same operational providers as the dashboard.
        </p>
        <IntegrityNote>
          Project entries come from community submissions and clearly-marked demonstration data. ECOGENESIS does not
          claim any project is active without evidence — verification status is shown per project. Point lookups use
          the same operational providers as the dashboard (Open-Meteo CAMS / GBIF).
        </IntegrityNote>
      </header>

      {/* ------------------------------ FILTERS ------------------------------ */}
      <GlassCard className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="w-full md:w-52">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger aria-label="Filter by category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-44">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, description or place"
            className="pl-8"
            aria-label="Search projects"
            maxLength={120}
          />
        </div>
      </GlassCard>

      {/* ------------------------- MAP + SIDE PANELS ------------------------- */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MousePointerClick className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
            Click anywhere on the map for live model air quality at that point.
          </p>
          <div
            ref={containerRef}
            id="ecogenesis-map"
            className="h-[520px] w-full rounded-2xl border border-border/60 overflow-hidden relative z-0"
            role="application"
            aria-label="Global community projects map"
          />
          <div className="flex flex-wrap items-center gap-2" aria-label="Category colour legend">
            {CATEGORIES.map((c) => (
              <span
                key={c.value}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/40 px-2.5 py-1 text-[11px] text-muted-foreground"
              >
                <span className="h-2 w-2 rounded-full" style={{ background: catColor(c.value) }} aria-hidden="true" />
                {c.label}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* Point snapshot */}
          <GlassCard className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <MousePointerClick className="h-4 w-4 text-primary" /> Environmental snapshot
              </h2>
              {point && air.data && <DataBadge kind={airBadge} />}
            </div>

            {!point ? (
              <EmptyState
                icon={<MousePointerClick className="h-8 w-8" />}
                title="No point selected"
                hint="Click anywhere on the map to look up live model air quality for that location."
              />
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  Point: <span className="font-mono text-foreground/85">{point.lat.toFixed(4)}, {point.lng.toFixed(4)}</span>
                </p>

                {air.loading ? (
                  <Skeleton className="h-28 w-full rounded-xl" />
                ) : air.error ? (
                  <p className="text-xs text-destructive">Air-quality provider unreachable — {air.error}</p>
                ) : air.data ? (
                  <div className="rounded-xl border border-border/60 bg-background/40 p-3">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2 text-sm">
                      <span className="text-muted-foreground">PM2.5</span>
                      <span className="font-mono font-medium">
                        {pm25 ? `${fmtNum(pm25.value, 1)} µg/m³` : "—"}
                        {pm25?.stale && <DataBadge kind="stale" className="ml-2" />}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 text-sm">
                      <span className="text-muted-foreground">US AQI</span>
                      <span className="font-mono font-medium">{usAqi ? fmtNum(usAqi.value, 0) : "—"}</span>
                    </div>
                    {pm25 && (
                      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                        Observed {timeAgo(pm25.observedAt)} · CAMS model estimate for the nearest grid cell, not a station measurement.
                      </p>
                    )}
                  </div>
                ) : null}
                {air.data && <SourcePanel provenance={air.data.provenance} compact />}

                <div className="space-y-2 border-t border-border/60 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary/40"
                    onClick={() => setScan(true)}
                    disabled={bio.loading}
                  >
                    <Radar className="mr-1.5 h-3.5 w-3.5" /> {bio.loading ? "Scanning..." : "Scan biodiversity (10 km)"}
                  </Button>

                  {scan && (
                    <>
                      {bio.loading ? (
                        <Skeleton className="h-24 w-full rounded-xl" />
                      ) : bio.error ? (
                        <p className="text-xs text-destructive">GBIF unreachable — no snapshot available: {bio.error}</p>
                      ) : bio.data ? (
                        <div className="space-y-2">
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono text-2xl font-semibold text-gradient-eco">{fmtNum(bio.data.totalCount, 0)}</span>
                            <span className="text-xs text-muted-foreground">occurrence records within {bio.data.radiusKm} km</span>
                          </div>
                          <div className="scroll-slim max-h-40 space-y-1 overflow-y-auto pr-1">
                            {bio.data.speciesCounts.slice(0, 5).map((s) => (
                              <div key={s.species} className="flex items-center justify-between gap-3 text-xs">
                                <span className="truncate italic text-foreground/85">{s.species}</span>
                                <span className="shrink-0 font-mono text-muted-foreground">{s.count} · {s.kingdom}</span>
                              </div>
                            ))}
                          </div>
                          <SourcePanel provenance={bio.data.provenance} compact />
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              </>
            )}
          </GlassCard>

          {/* Project list */}
          <GlassCard className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Bird className="h-4 w-4 text-primary" /> Projects on map
              </h2>
              <span className="text-xs text-muted-foreground">{projects.data?.projects.length ?? 0}</span>
            </div>
            <div className="scroll-slim max-h-96 space-y-1.5 overflow-y-auto pr-1">
              {projects.loading ? (
                [0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
              ) : projects.error ? (
                <p className="text-xs text-destructive">Could not load projects: {projects.error}</p>
              ) : (projects.data?.projects.length ?? 0) === 0 ? (
                <p className="px-1 py-6 text-center text-xs text-muted-foreground">No projects match these filters.</p>
              ) : (
                (projects.data?.projects ?? []).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => focusProject(p)}
                    className="flex w-full items-start gap-2.5 rounded-xl border border-border/50 bg-background/30 px-3 py-2.5 text-left transition-colors hover:border-primary/40 hover:bg-primary/[0.06]"
                  >
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: catColor(p.category) }} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="truncate text-sm font-medium">{p.title}</span>
                        {p.isDemo ? (
                          <DataBadge kind="demo" />
                        ) : (
                          <DataBadge kind={p.verification === "verified" ? "verified" : "self-reported"} />
                        )}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {p.placeName} · {p.participantCount} participant{p.participantCount === 1 ? "" : "s"}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
