"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Bird,
  Bot,
  Calculator,
  Droplets,
  FileDown,
  Handshake,
  Home,
  Map as MapIcon,
  Recycle,
  Sun,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SessionProvider, useSession } from "./session";
import { AuthDialog } from "./auth-dialog";
import { cn } from "@/lib/utils";

import HomeView from "./home-view";
import DashboardView from "./dashboard-view";
import AssistantView from "./assistant-view";
import FootprintView from "./footprint-view";
import PlannerView from "./planner-view";
import WasteView from "./waste-view";
import WaterView from "./water-view";
import EnergyView from "./energy-view";
import BiodiversityView from "./biodiversity-view";
import MapView from "./map-view";
import CommunityView from "./community-view";
import ReportsView from "./reports-view";

export type ViewKey =
  | "home"
  | "dashboard"
  | "assistant"
  | "footprint"
  | "planner"
  | "waste"
  | "water"
  | "energy"
  | "biodiversity"
  | "map"
  | "community"
  | "reports";

const NAV: { key: ViewKey; label: string; icon: React.ElementType }[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "dashboard", label: "Intelligence Dashboard", icon: Activity },
  { key: "assistant", label: "AI Assistant", icon: Bot },
  { key: "footprint", label: "My Footprint", icon: Calculator },
  { key: "planner", label: "Sustainable Living", icon: Target },
  { key: "waste", label: "Waste Management", icon: Recycle },
  { key: "water", label: "Water Conservation", icon: Droplets },
  { key: "energy", label: "Renewable Energy", icon: Sun },
  { key: "biodiversity", label: "Biodiversity", icon: Bird },
  { key: "map", label: "Global Action Map", icon: MapIcon },
  { key: "community", label: "Community", icon: Handshake },
  { key: "reports", label: "Reports", icon: FileDown },
];

function Logo({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="group flex items-center gap-2.5" aria-label="ECOGENESIS home">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-primary/40 bg-primary/10">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-accent" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 21c-5-3.5-8-7.5-8-11a8 8 0 0 1 16 0c0 3.5-3 7.5-8 11Z" />
          <path d="M12 21V9" />
          <path d="M12 13c-1.8-.4-3.2-1.8-3.6-3.6M12 10c1.8-.4 3.2-1.8 3.6-3.6" />
        </svg>
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent neon-dot" />
      </span>
      <span className="flex flex-col items-start leading-none">
        <span className="text-sm font-bold tracking-[0.22em] text-foreground">ECOGENESIS</span>
        <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Environmental Intelligence</span>
      </span>
    </button>
  );
}

function Header({ view, navigate }: { view: ViewKey; navigate: (v: ViewKey) => void }) {
  const { user, setAuthOpen } = useSession();
  return (
    <header className="no-print sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <Logo onClick={() => navigate("home")} />
        <nav className="hidden items-center gap-1 xl:flex" aria-label="Main navigation">
          {NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(item.key)}
              className={cn(
                "rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                view === item.key
                  ? "bg-primary/15 text-accent"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
              aria-current={view === item.key ? "page" : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden border-primary/40 bg-primary/10 hover:bg-primary/20 sm:inline-flex" onClick={() => setAuthOpen(true)}>
            {user && !user.isAnonymous ? user.name || "Account" : "Sign in"}
          </Button>
        </div>
      </div>
      <div className="border-t border-border/40 xl:hidden">
        <div className="scroll-slim flex gap-1 overflow-x-auto px-4 py-2" role="tablist" aria-label="Sections">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                role="tab"
                aria-selected={view === item.key}
                onClick={() => navigate(item.key)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  view === item.key
                    ? "border-accent/50 bg-accent/15 text-accent"
                    : "border-border/70 bg-secondary/40 text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}

function Footer({ navigate }: { navigate: (v: ViewKey) => void }) {
  return (
    <footer className="no-print mt-auto border-t border-border/60 bg-background/70 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <div className="text-sm font-bold tracking-[0.2em] text-foreground">ECOGENESIS</div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Make sustainability measurable. Make environmental action accessible. Make a better future practical.
            </p>
          </div>
          <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
            <div className="font-semibold text-foreground/85">Data integrity</div>
            <p>
              Environmental indicators come from named providers (Open-Meteo/CAMS, NASA POWER, GBIF, ERA5) with full
              provenance. Calculations use published emission factors. Estimates are never presented as measurements, and
              every indicator carries a source panel.
            </p>
            <Link href="#" onClick={(e) => { e.preventDefault(); navigate("dashboard"); }} className="inline-block text-primary hover:underline">
              View live integration status →
            </Link>
          </div>
          <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
            <div className="font-semibold text-foreground/85">Platform</div>
            <p>
              Explore freely without an account. Data you enter persists in your private session; registered accounts
              keep history across devices. Images and observations you submit are never shared beyond the community
              features you choose.
            </p>
            <p className="pt-1 text-muted-foreground/70">Illustrative demonstration datasets are always labelled “DEMO DATA”.</p>
          </div>
        </div>
        <div className="mt-6 hairline-gradient" />
        <div className="flex flex-col gap-1 pt-4 text-[11px] text-muted-foreground/80 md:flex-row md:items-center md:justify-between">
          <span>ECOGENESIS — environmental intelligence for everyday action.</span>
          <span>Free data sources are used under their respective licences; see each indicator’s source panel.</span>
        </div>
      </div>
    </footer>
  );
}

function Shell() {
  const [view, setView] = useState<ViewKey>("home");
  const navigate = useMemo(() => (v: ViewKey) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="eco-grid-bg flex min-h-screen flex-col bg-background text-foreground">
      <Header view={view} navigate={navigate} />
      <main className="flex-1">
        <div key={view} className="eco-rise">
          {view === "home" && <HomeView navigate={navigate} />}
          {view === "dashboard" && <DashboardView navigate={navigate} />}
          {view === "assistant" && <AssistantView />}
          {view === "footprint" && <FootprintView />}
          {view === "planner" && <PlannerView />}
          {view === "waste" && <WasteView />}
          {view === "water" && <WaterView />}
          {view === "energy" && <EnergyView />}
          {view === "biodiversity" && <BiodiversityView />}
          {view === "map" && <MapView />}
          {view === "community" && <CommunityView />}
          {view === "reports" && <ReportsView />}
        </div>
      </main>
      <Footer navigate={navigate} />
      <AuthDialog />
    </div>
  );
}

export default function EcoGenesisApp() {
  return (
    <SessionProvider>
      <Shell />
    </SessionProvider>
  );
}
