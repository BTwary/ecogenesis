"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Calculator,
  CloudSun,
  Droplets,
  Leaf,
  Recycle,
  Sun,
  Wind,
  Activity,
  Handshake,
  Map as MapIcon,
  Bird,
  Target,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard, DataBadge, SourcePanel, StatTile, SectionHeading, IntegrityNote, type DataKind } from "./ui-kit";
import { api, useAsync, fmtNum, timeAgo } from "@/lib/client";
import type { ViewKey } from "./app-shell";

const CITIES = [
  { id: "delhi", name: "Delhi", lat: 28.61, lng: 77.21 },
  { id: "mumbai", name: "Mumbai", lat: 19.07, lng: 72.87 },
  { id: "bengaluru", name: "Bengaluru", lat: 12.97, lng: 77.59 },
  { id: "chennai", name: "Chennai", lat: 13.08, lng: 80.27 },
  { id: "kolkata", name: "Kolkata", lat: 22.57, lng: 88.36 },
  { id: "hyderabad", name: "Hyderabad", lat: 17.38, lng: 78.48 },
  { id: "london", name: "London", lat: 51.51, lng: -0.13 },
  { id: "newyork", name: "New York", lat: 40.71, lng: -74.01 },
  { id: "tokyo", name: "Tokyo", lat: 35.68, lng: 139.65 },
  { id: "saopaulo", name: "São Paulo", lat: -23.55, lng: -46.63 },
  { id: "nairobi", name: "Nairobi", lat: -1.29, lng: 36.82 },
  { id: "sydney", name: "Sydney", lat: -33.87, lng: 151.21 },
];

interface AirResponse {
  latest: Record<string, { value: number; observedAt: string; stale: boolean } | null>;
  provenance: {
    providerName: string;
    retrievedAt: string | null;
    cached: boolean;
    licence: string;
    sourceUrl: string;
    notes?: string;
    warning?: string;
  };
  quality: { newestObservation: string | null };
}

interface SolarResponse {
  annualMeanGhi: number | null;
  provenance: { providerName: string; retrievedAt: string | null; cached: boolean };
}

interface ProjectsResponse {
  projects: {
    id: string;
    title: string;
    category: string;
    status: string;
    placeName: string;
    isDemo: boolean;
    participantCount: number;
    verification: string;
  }[];
}

function aqiCategory(usAqi: number | null): { label: string; tone: "good" | "moderate" | "bad" } {
  if (usAqi === null) return { label: "no data", tone: "moderate" };
  if (usAqi <= 100) return { label: "US AQI ≤ 100", tone: "good" };
  if (usAqi <= 200) return { label: "US AQI 101-200", tone: "moderate" };
  return { label: "US AQI > 200", tone: "bad" };
}

export default function HomeView({ navigate }: { navigate: (v: ViewKey) => void }) {
  const [city, setCity] = useState("delhi");
  const selected = CITIES.find((c) => c.id === city)!;

  const air = useAsync<AirResponse>(() => api(`/api/env/air?lat=${selected.lat}&lng=${selected.lng}${["delhi", "mumbai", "bengaluru", "chennai", "kolkata", "hyderabad"].includes(city) ? `&city=${encodeURIComponent(selected.name)}` : ""}`), [selected.lat, selected.lng, city]);
  const solar = useAsync<SolarResponse>(() => api(`/api/env/solar?lat=${selected.lat}&lng=${selected.lng}`), [selected.lat, selected.lng]);
  const projects = useAsync<ProjectsResponse>(() => api("/api/projects"), []);

  const pm25 = air.data?.latest.pm2_5?.value ?? null;
  const aqi = air.data?.latest.us_aqi?.value ?? null;
  const aqiCat = aqiCategory(aqi);
  const pm25Badge: DataKind = air.data?.provenance.cached ? "cached" : "estimate";

  const featured = useMemo(() => (projects.data?.projects ?? []).slice(0, 3), [projects.data]);

  const modules: { key: ViewKey; icon: React.ElementType; title: string; desc: string }[] = [
    { key: "dashboard", icon: Activity, title: "Intelligence Dashboard", desc: "Real environmental indicators with provenance for any location." },
    { key: "assistant", icon: Bot, title: "AI Sustainability Assistant", desc: "Grounded advice: issue, actions, estimated benefit, difficulty, cost, confidence." },
    { key: "footprint", icon: Calculator, title: "My Footprint", desc: "Transparent calculator using published emission factors — every factor traceable." },
    { key: "planner", icon: Target, title: "Sustainable Living", desc: "Goals, weekly challenges and progress tracking that reward verified activity." },
    { key: "waste", icon: Recycle, title: "Waste Management", desc: "Sorting guidance, AI photo identification, tracking and diversion metrics." },
    { key: "water", icon: Droplets, title: "Water Conservation", desc: "Usage calculator, logging, and rainwater-harvesting potential from ERA5 rainfall data." },
    { key: "energy", icon: Sun, title: "Renewable Energy", desc: "Solar potential from NASA POWER climatology with payback and emissions math." },
    { key: "biodiversity", icon: Bird, title: "Biodiversity", desc: "GBIF species explorer plus your own observation submissions." },
    { key: "map", icon: MapIcon, title: "Global Action Map", desc: "Projects, biodiversity scans and point-based environmental lookups." },
    { key: "community", icon: Handshake, title: "Community Network", desc: "Launch initiatives, join projects, report impact transparently." },
    { key: "reports", icon: FileDown, title: "Reports", desc: "Environmental performance summary with CSV export and print-ready output." },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6">
      {/* ------------------------------- HERO ------------------------------- */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-intelligence.png"
            alt="Futuristic environmental intelligence dashboard visualisation"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/55 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />
        </div>
        <div className="relative z-10 px-5 py-16 md:px-12 md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
            <span className="eco-pulse h-1.5 w-1.5 rounded-full bg-accent" />
            Environmental Intelligence Platform
          </div>
          <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl">
            THE FUTURE IS NOT SOMETHING WE WAIT FOR.{" "}
            <span className="text-gradient-eco">IT IS SOMETHING WE BUILD.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/80 md:text-lg">
            Understand your environmental impact. Discover smarter alternatives. Turn sustainable intentions into
            measurable action — with real data, transparent calculations and AI that shows its sources.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button size="lg" onClick={() => navigate("dashboard")} className="bg-primary text-primary-foreground hover:bg-primary/85">
              <Activity className="mr-2 h-5 w-5" /> Explore Environmental Intelligence
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("footprint")} className="border-accent/50 bg-background/40 text-accent hover:bg-accent/10">
              <Calculator className="mr-2 h-5 w-5" /> Calculate My Footprint
            </Button>
            <Button size="lg" variant="ghost" onClick={() => navigate("assistant")} className="text-foreground/85 hover:bg-secondary">
              <Bot className="mr-2 h-5 w-5 text-primary" /> Meet Your AI Sustainability Assistant
            </Button>
          </div>
        </div>
      </section>

      {/* ---------------------- GLOBAL INTELLIGENCE OVERVIEW ---------------------- */}
      <section className="mt-14" aria-labelledby="gi-overview">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Live environmental intelligence"
            title={<span id="gi-overview">A global intelligence centre, grounded in named data sources</span>}
            description="Indicators below are retrieved from operational providers right now — not invented statistics. Model-based values are labelled as such; open the source panel on any indicator to see provider, licence, retrieval time and coverage."
          />
          <div className="w-full max-w-56">
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger aria-label="Choose a city">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label={`Air quality · ${selected.name}`}
            value={pm25 === null ? "—" : fmtNum(pm25, 0)}
            unit="µg/m³ PM2.5"
            badge={<DataBadge kind={pm25Badge} />}
            icon={<Wind className="h-4 w-4" />}
            sub={
              air.loading
                ? "Retrieving CAMS model estimate..."
                : aqi === null
                  ? "No valid observation for this grid cell."
                  : `${aqiCat.label} · observed ${timeAgo(air.data?.latest.pm2_5?.observedAt)}`
            }
          />
          <StatTile
            label="Solar resource"
            value={solar.data?.annualMeanGhi === null || solar.data === null ? "—" : fmtNum(solar.data.annualMeanGhi, 2)}
            unit="kWh/m²/day"
            badge={<DataBadge kind="historical" label="CLIMATOLOGY" />}
            icon={<Sun className="h-4 w-4" />}
            sub={
              solar.loading
                ? "Retrieving NASA POWER climatology..."
                : `22-year satellite-derived mean · ${solar.data?.provenance.providerName ?? "NASA POWER"}`
            }
          />
          <StatTile
            label="Model update"
            value={air.data?.provenance.retrievedAt ? timeAgo(air.data.provenance.retrievedAt).replace(" ago", "") : "—"}
            unit="since retrieval"
            badge={<DataBadge kind="estimate" label="MODEL" />}
            icon={<CloudSun className="h-4 w-4" />}
            sub="CAMS air-quality model output for the nearest grid cell — not a station measurement."
          />
          <StatTile
            label="Community projects"
            value={fmtNum(projects.data?.projects.length ?? 0, 0)}
            unit="tracked"
            badge={<DataBadge kind="demo" />}
            icon={<Handshake className="h-4 w-4" />}
            sub="Includes clearly-marked demonstration entries. Launch yours in the Community module."
          />
        </div>

        {air.data && (
          <div className="mt-4">
            <SourcePanel provenance={{ ...air.data.provenance, provider: "open-meteo" }} extra={[{ label: "Coverage", value: "Global gridded model (CAMS) at the requested point" }]} />
          </div>
        )}
        {air.error && (
          <GlassCard className="mt-4 border-destructive/40 bg-destructive/[0.06]">
            <p className="text-sm text-destructive">Environmental data provider unreachable: {air.error}. No substitute readings are shown.</p>
          </GlassCard>
        )}
      </section>

      {/* ----------------------------- MODULES GRID ----------------------------- */}
      <section className="mt-16" aria-labelledby="modules">
        <SectionHeading
          eyebrow="One integrated ecosystem"
          title={<span id="modules">Eleven modules, one intelligence layer</span>}
          description="Every module is functional, connected to real data or transparent calculations, and designed to hand its results to the next step — measure, plan, act, verify, report."
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <GlassCard key={m.key} hover className="cursor-pointer" >
                <button onClick={() => navigate(m.key)} className="flex h-full w-full flex-col items-start gap-2 text-left">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-base font-semibold">{m.title}</span>
                  <span className="text-sm leading-relaxed text-muted-foreground">{m.desc}</span>
                  <span className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-medium text-accent">
                    Open module <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </button>
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* --------------------------- FEATURED PROJECTS --------------------------- */}
      <section className="mt-16 grid gap-6 lg:grid-cols-5" aria-labelledby="featured">
        <div className="lg:col-span-3">
          <SectionHeading
            eyebrow="Featured initiatives"
            title={<span id="featured">Environmental action, organised</span>}
            description="Community projects with participation tracking and transparent impact reporting. Demonstration entries are labelled; user-created entries are self-reported until evidence is reviewed."
          />
          <div className="mt-6 space-y-3">
            {projects.loading &&
              [0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
            {featured.map((p) => (
              <GlassCard key={p.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">{p.title}</span>
                    {p.isDemo ? <DataBadge kind="demo" /> : <DataBadge kind={p.verification === "verified" ? "verified" : "self-reported"} />}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {p.category} · {p.placeName} · {p.status} · {p.participantCount} participant{p.participantCount === 1 ? "" : "s"}
                  </p>
                </div>
                <Button size="sm" variant="outline" className="shrink-0 border-primary/40" onClick={() => navigate("community")}>
                  View <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </GlassCard>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="relative h-full min-h-64 overflow-hidden rounded-3xl border border-border/60">
            <Image
              src="/images/community-planting.png"
              alt="Hands planting a young sapling"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="text-lg font-semibold leading-snug">Reward verified actions, not clicks.</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Badges and progress are earned through logged activity — calculations saved, waste audited, goals
                completed, observations submitted.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------ INTEGRITY ------------------------------ */}
      <section className="mt-16" aria-labelledby="integrity">
        <SectionHeading
          eyebrow="Trust, transparency, integrity"
          title={<span id="integrity">What this platform will never do</span>}
        />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <GlassCard>
            <Leaf className="h-6 w-6 text-primary" />
            <p className="mt-3 text-sm font-semibold">No invented statistics</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Every environmental number is either retrieved from a named provider, derived arithmetically from your
              inputs with published factors, or explicitly labelled as an assumption.
            </p>
          </GlassCard>
          <GlassCard>
            <CloudSun className="h-6 w-6 text-chart-3" />
            <p className="mt-3 text-sm font-semibold">No fake “live” data</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Datasets that update hourly, daily or annually are labelled accordingly. If a provider is unreachable we
              show a warning — we never substitute simulated readings.
            </p>
          </GlassCard>
          <GlassCard>
            <Recycle className="h-6 w-6 text-accent" />
            <p className="mt-3 text-sm font-semibold">No unverifiable claims</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Impact claims start as self-reported. Verification requires evidence. Estimated benefits are kept clearly
              separate from actual logged outcomes.
            </p>
          </GlassCard>
        </div>
        <div className="mt-4">
          <IntegrityNote />
        </div>
      </section>

      {/* ------------------------------ FINAL CTA ------------------------------ */}
      <section className="mt-16 mb-10" aria-labelledby="cta">
        <div className="relative overflow-hidden rounded-3xl border border-primary/25">
          <div className="absolute inset-0">
            <Image src="/images/hero-earth.png" alt="Forest canopy meeting a modern green city at dusk" fill className="object-cover" sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/60" />
          </div>
          <div className="relative z-10 p-8 md:p-14">
            <h3 id="cta" className="max-w-2xl text-2xl font-bold tracking-tight md:text-4xl">
              Start with one honest measurement today.
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              No account needed. Calculate your footprint, check your city&apos;s air, scan the biodiversity around you —
              then turn what you learn into tracked, verifiable action.
            </p>
            <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row">
              <Button size="lg" onClick={() => navigate("footprint")} className="bg-accent text-accent-foreground hover:bg-accent/85">
                Calculate My Footprint <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("assistant")} className="border-primary/40 bg-background/40">
                Ask the AI Assistant
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
