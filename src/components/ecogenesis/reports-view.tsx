"use client";

import { Printer, FileSpreadsheet, Award, Lock, Activity, Droplets, Trash2, Target, Leaf, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { GlassCard, DataBadge, SectionHeading, Donut, GaugeRing, Sparkline, IntegrityNote, CHART_COLORS } from "./ui-kit";
import { api, useAsync, fmtNum, fmtDate, timeAgo } from "@/lib/client";

interface SummaryResponse {
  user: { name: string | null; accountType: string };
  footprint: {
    totalKg: number;
    categories: { key: string; label: string; kgCo2e: number }[];
    createdAt: string;
    history: { totalKg: number; createdAt: string }[];
  } | null;
  activity: { goalsTotal: number; goalsActive: number; goalsCompleted: number; progressEntries: number; wasteLogs: number; waterLogs: number; observations: number; participations: number };
  score: { value: number; max: number; components: { label: string; max: number; value: number }[]; disclaimer: string };
  badges: { id: string; label: string; description: string; earned: boolean; evidence: string }[];
  benchmarks: { india: { value: number; source: string }; world: { value: number; source: string } };
}

interface WaterResponse {
  summary: { total30Days: number; total7Days: number; avgPerDay: number | null; co2eKg30Days: number; method: string };
}

interface WasteResponse {
  summary: { totalKg: number; landfillDiversionPercent: number | null; avoidedKgCo2e: number; avoidanceMethod: string; byDisposal: Record<string, number> };
}

export default function ReportsView() {
  const summary = useAsync<SummaryResponse>(() => api("/api/me/summary"), []);
  const water = useAsync<WaterResponse>(() => api("/api/water"), [summary.data]);
  const waste = useAsync<WasteResponse>(() => api("/api/waste"), [summary.data]);

  const s = summary.data;
  const trend = (s?.footprint.history ?? []).map((h) => h.totalKg / 1000);
  const generated = fmtDate(new Date());

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 md:px-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <SectionHeading
          eyebrow="Reporting & analytics"
          title="Environmental performance report"
          description={`Generated ${generated} for ${s?.user.name ?? "your session"} (${s?.user.accountType ?? "individual"} account). Every figure below is a self-reported entry or a documented platform estimate with its methodology attached.`}
        />
        <div className="no-print flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="border-primary/40" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Print / PDF
          </Button>
          <a href="/api/reports/export?format=csv" download>
            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/85 sm:w-auto">
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </a>
        </div>
      </div>

      {summary.loading && <Skeleton className="h-96 w-full rounded-2xl" />}

      {summary.error && (
        <GlassCard className="border-destructive/40">
          <p className="text-sm text-destructive">Report data unavailable: {summary.error}</p>
        </GlassCard>
      )}

      {s && (
        <>
          {/* Overview */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <GlassCard className="flex items-center gap-4">
              <GaugeRing value={s.score.value} max={s.score.max} size={90} label={String(s.score.value)} sub={`of ${s.score.max}`} color="#a3e635" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">Engagement score</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{s.score.disclaimer}</p>
              </div>
            </GlassCard>
            <GlassCard className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Latest per-person footprint estimate</p>
              <p className="font-mono text-3xl font-semibold text-gradient-eco">{s.footprint ? `${fmtNum(s.footprint.totalKg / 1000, 2)} t` : "—"}</p>
              <p className="text-xs text-muted-foreground">{s.footprint ? `CO2e/person/year · saved ${timeAgo(s.footprint.createdAt)}` : "No calculation saved yet"}</p>
              {trend.length >= 2 && <Sparkline points={trend} />}
            </GlassCard>
            <GlassCard className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Reference context (fossil CO2)</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span>India average</span><span className="font-mono">{s.benchmarks.india.value} t</span></div>
                <div className="flex justify-between"><span>World average</span><span className="font-mono">{s.benchmarks.world.value} t</span></div>
                <div className="flex justify-between font-medium"><span>Your allocated estimate</span><span className="font-mono">{s.footprint ? `${fmtNum(s.footprint.totalKg / 1000, 2)} t` : "—"}</span></div>
              </div>
              <p className="text-[10px] leading-relaxed text-muted-foreground/80">Fossil CO2-only references; not directly comparable with the broader CO2e estimate. Sources: {s.benchmarks.india.source}; {s.benchmarks.world.source}</p>
            </GlassCard>
            <GlassCard className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tracked activity</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                <span className="flex items-center gap-1.5"><Target className="h-3.5 w-3.5 text-primary" /> {s.activity.goalsCompleted}/{s.activity.goalsTotal} goals</span>
                <span className="flex items-center gap-1.5"><Droplets className="h-3.5 w-3.5 text-chart-3" /> {s.activity.waterLogs} water logs</span>
                <span className="flex items-center gap-1.5"><Trash2 className="h-3.5 w-3.5 text-chart-4" /> {s.activity.wasteLogs} waste logs</span>
                <span className="flex items-center gap-1.5"><Leaf className="h-3.5 w-3.5 text-accent" /> {s.activity.observations} observations</span>
                <span className="flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-primary" /> {s.activity.participations} participations</span>
                <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-muted-foreground" /> {s.activity.progressEntries} progress entries</span>
              </div>
            </GlassCard>
          </div>

          {/* Footprint detail */}
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">1. Carbon footprint summary</h3>
              <DataBadge kind="estimate" />
            </div>
            {s.footprint ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <Donut
                  segments={s.footprint.categories.map((c, i) => ({ label: c.label, value: c.kgCo2e, color: CHART_COLORS[i % CHART_COLORS.length] }))}
                  centerValue={`${fmtNum(s.footprint.totalKg / 1000, 1)}t`}
                  centerLabel="annual"
                />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Category breakdown</p>
                  {s.footprint.categories.map((c, i) => (
                    <div key={c.key}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{c.label}</span>
                        <span className="font-mono text-muted-foreground">{fmtNum(c.kgCo2e / 1000, 2)} t ({fmtNum((c.kgCo2e / Math.max(1, s.footprint!.totalKg)) * 100, 0)}%)</span>
                      </div>
                      <Progress value={(c.kgCo2e / Math.max(1, s.footprint!.totalKg)) * 100} className="mt-1 h-1.5" />
                    </div>
                  ))}
                  <p className="pt-2 text-[11px] leading-relaxed text-muted-foreground">
                    Calculated by the ECOGENESIS footprint calculator from your inputs using published emission factors
                    (UK DEFRA 2023; CEA India grid factor v21.0; Scarborough et al. 2014 dietary GHG estimates). A factor
                    snapshot is stored with every saved calculation. Estimates are not measurements.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No footprint calculation saved yet — complete the My Footprint module to include this section.</p>
            )}
          </GlassCard>

          {/* Water & waste */}
          <div className="grid gap-4 lg:grid-cols-2">
            <GlassCard className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">2. Water consumption</h3>
                <DataBadge kind="estimate" />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-border/60 bg-background/40 p-3">
                  <p className="text-xs text-muted-foreground">Last 7 days</p>
                  <p className="mt-1 font-mono text-xl font-semibold">{water.data ? `${fmtNum(water.data.summary.total7Days, 0)} L` : "—"}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/40 p-3">
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                  <p className="mt-1 font-mono text-xl font-semibold">{water.data ? `${fmtNum(water.data.summary.total30Days, 0)} L` : "—"}</p>
                </div>
              </div>
              {water.data && <p className="text-[11px] leading-relaxed text-muted-foreground">{water.data.summary.method}</p>}
              {!water.loading && (water.data?.summary.total30Days ?? 0) === 0 && (
                <p className="text-xs text-muted-foreground">No water logs yet — start logging in the Water Conservation module.</p>
              )}
            </GlassCard>

            <GlassCard className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">3. Waste generation</h3>
                <DataBadge kind="estimate" />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-border/60 bg-background/40 p-3">
                  <p className="text-xs text-muted-foreground">Total logged</p>
                  <p className="mt-1 font-mono text-xl font-semibold">{waste.data ? `${fmtNum(waste.data.summary.totalKg, 1)} kg` : "—"}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/40 p-3">
                  <p className="text-xs text-muted-foreground">Landfill diversion</p>
                  <p className="mt-1 font-mono text-xl font-semibold">{waste.data?.landfillDiversionPercent != null ? `${fmtNum(waste.data.summary.landfillDiversionPercent, 0)}%` : "—"}</p>
                </div>
              </div>
              {waste.data && waste.data.summary.avoidedKgCo2e > 0 && (
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Estimated landfill-emissions avoided through recycling/composting: <span className="font-mono">{fmtNum(waste.data.summary.avoidedKgCo2e, 1)} kgCO2e</span>. {waste.data.summary.avoidanceMethod}
                </p>
              )}
              {!waste.loading && (waste.data?.summary.totalKg ?? 0) === 0 && (
                <p className="text-xs text-muted-foreground">No waste logs yet — start logging in the Waste Management module.</p>
              )}
            </GlassCard>
          </div>

          {/* Goals */}
          <GlassCard className="space-y-3">
            <h3 className="text-lg font-semibold">4. Progress against targets</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                <p className="font-mono text-2xl font-semibold text-accent">{s.activity.goalsActive}</p>
                <p className="mt-1 text-xs text-muted-foreground">active goals</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                <p className="font-mono text-2xl font-semibold text-primary">{s.activity.goalsCompleted}</p>
                <p className="mt-1 text-xs text-muted-foreground">completed</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                <p className="font-mono text-2xl font-semibold">{s.activity.progressEntries}</p>
                <p className="mt-1 text-xs text-muted-foreground">progress entries</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Completed goals reflect logged activity reaching the stated target — see the Sustainable Living module for details.</p>
          </GlassCard>

          {/* Badges */}
          <GlassCard className="space-y-4">
            <h3 className="text-lg font-semibold">5. Achievements</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {s.badges.map((b) => (
                <div key={b.id} className={`rounded-xl border p-3 ${b.earned ? "border-accent/40 bg-accent/[0.07]" : "border-border/60 bg-background/30 opacity-60"}`}>
                  <div className="flex items-center gap-2">
                    {b.earned ? <Award className="h-5 w-5 text-accent" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                    <p className="text-sm font-medium">{b.label}</p>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{b.description}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground/70">{b.evidence}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">Badges are awarded only for verifiable platform activity (saved calculations, logged entries, completed goals) — never for simple clicks.</p>
          </GlassCard>

          {/* Engagement score detail + methodology */}
          <GlassCard className="space-y-3">
            <h3 className="text-lg font-semibold">6. Score composition & methodology</h3>
            <div className="space-y-1.5">
              {s.score.components.map((c) => (
                <div key={c.label}>
                  <div className="flex items-center justify-between text-xs">
                    <span>{c.label}</span>
                    <span className="font-mono text-muted-foreground">{c.value}/{c.max}</span>
                  </div>
                  <Progress value={(c.value / c.max) * 100} className="mt-1 h-1" />
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-border/60 bg-background/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
              <p className="font-medium text-foreground/80">Data sources & calculation assumptions</p>
              <p className="mt-1">
                Footprint: UK DEFRA 2023 conversion factors (transport, LPG, gas, waste, water), CEA India CO2 Baseline
                Database v21.0 (grid electricity), Scarborough et al. 2014 (dietary GHG), Global Carbon Budget 2023
                (benchmarks), manufacturer-published product LCAs (electronics, illustrative midpoints). Water and waste
                aggregates use only values you logged. Environmental indicators elsewhere in the platform: Open-Meteo
                (CAMS air quality, ERA5 archive), NASA POWER, GBIF — each with per-indicator provenance panels. CSV
                exports include methodology headers per section.
              </p>
              <p className="mt-2 font-medium text-foreground/80">Limitations</p>
              <p className="mt-1">
                All platform estimates are planning aids, not audits. Emission factors are regional averages and may not
                match your local conditions. Benchmarks are fossil-CO2 averages and are not like-for-like with the
                consumption-based calculator. Engagement score measures platform usage, not environmental impact.
              </p>
            </div>
          </GlassCard>

          <IntegrityNote>
            This report distinguishes estimated values from logged outcomes throughout. For a fully traceable export of
            the underlying entries, use the CSV download — it includes methodology headers per section.
          </IntegrityNote>

          <p className="pb-4 text-center text-[10px] text-muted-foreground/70">
            ECOGENESIS environmental performance report · generated {generated} · estimates unless stated otherwise
          </p>
        </>
      )}
    </div>
  );
}
