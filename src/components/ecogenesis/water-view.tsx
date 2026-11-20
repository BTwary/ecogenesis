"use client";

import { useEffect, useState } from "react";
import { Calculator, CloudRain, Droplets, History, Lightbulb, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard, DataBadge, StatTile, BarChart, IntegrityNote, EmptyState, SourcePanel } from "./ui-kit";
import { api, useAsync, fmtNum } from "@/lib/client";
import { toast } from "@/hooks/use-toast";
import { CITIES } from "./city-list";

/* ---------------------------------- types --------------------------------- */

interface WaterLog {
  id: string;
  activity: string;
  liters: number;
  date: string;
}

interface WaterSummary {
  total30Days: number;
  total7Days: number;
  avgPerDay: number | null;
  byActivity: Record<string, number>;
  co2eKg30Days: number;
  method: string;
}

interface WaterResponse {
  logs: WaterLog[];
  summary: WaterSummary;
}

interface RainMonthly {
  month: string;
  totalMm: number;
  daysReported: number;
}

interface RainProvenance {
  providerName: string;
  datasetId: string;
  sourceUrl?: string;
  licence?: string;
  retrievedAt: string;
  cached?: boolean;
  stale?: boolean;
  warning?: string;
}

interface RainResponse {
  location: { lat: number; lng: number };
  window: { start: string; end: string };
  monthly: RainMonthly[];
  totalMm: number;
  analytics: { methodology: string; limitations: string[] };
  provenance: RainProvenance;
}

/* ------------------------ documented typical values ------------------------ */

const SHOWER_FLOW_L_MIN = 9; // typical shower flow
const TOILET_FLUSH_L = 8; // typical cistern flush
const LAUNDRY_LOAD_L = 60; // typical machine load
const DISHWASHER_CYCLE_L = 15; // per cycle
const HAND_BASIN_L_DAY = 20; // per household
const RUNNING_TAP_L_DAY = 60; // per household
const HOSE_L_MIN = 15; // garden hose

const WATER_ACTIVITIES = ["shower", "toilet", "laundry", "dishes", "cooking", "drinking", "cleaning", "garden", "other"] as const;
type WaterActivity = (typeof WATER_ACTIVITIES)[number];

const CATCHMENT_TYPES = [
  { id: "metal", label: "Metal / tile roof", coefficient: 0.9 },
  { id: "concrete", label: "Concrete", coefficient: 0.85 },
  { id: "pavers", label: "Pavers", coefficient: 0.7 },
  { id: "green", label: "Green / earth", coefficient: 0.5 },
] as const;
type CatchmentId = (typeof CATCHMENT_TYPES)[number]["id"];

const LEAK_GUIDANCE = [
  {
    title: "Arithmetic illustration",
    body: "A tap leaking 1 L/minute wastes 1 × 60 × 24 × 365 = 525,600 L ≈ 525 m³ per year. Illustration, not a measurement — real leaks vary.",
  },
  {
    title: "Night meter test",
    body: "Read your water meter last thing at night, then first thing in the morning with no water used overnight. If the meter has moved, something is leaking.",
  },
  {
    title: "Toilet dye test",
    body: "Add a few drops of food colouring to the cistern and wait without flushing. Colour appearing in the bowl means a silent flush-valve leak.",
  },
  {
    title: "Damp patches",
    body: "Persistent damp patches on walls, ceilings, floors or in the garden can indicate a hidden leak — investigate promptly.",
  },
];

const SAVING_TIPS = [
  { title: "Fit tap aerators", body: "Aerators mix air into the flow, cutting volume while the stream still feels strong." },
  { title: "Shorter showers", body: "Each minute less in the shower saves the shower flow rate multiplied by that minute, every day." },
  { title: "Full loads only", body: "Run washing machines and dishwashers only when full — the same water does more work." },
  { title: "Native, drought-tolerant plants", body: "Plants suited to your climate need far less supplementary watering once established." },
  { title: "Fix leaks promptly", body: "Leaks run continuously — a small drip accumulates litres every single hour it goes unrepaired." },
];

function NumField({
  label,
  value,
  onChange,
  unit,
  hint,
  min = 0,
  max = 100000,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  hint?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={min}
          max={max}
          value={value === 0 ? "" : String(value)}
          placeholder="0"
          onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || 0)))}
          className="font-mono"
        />
        {unit && <span className="shrink-0 text-xs text-muted-foreground">{unit}</span>}
      </div>
      {hint && <p className="text-[11px] text-muted-foreground/80">{hint}</p>}
    </div>
  );
}

/* --------------------------------- component ------------------------------- */

export default function WaterView() {
  const water = useAsync<WaterResponse>(() => api("/api/water"), []);

  /* household calculator state */
  const [calc, setCalc] = useState({
    people: 3,
    showersPerPerson: 1,
    showerMinutes: 8,
    toiletFlushesPerPerson: 5,
    laundryLoadsWeek: 4,
    dishMethod: "basin" as "basin" | "running" | "dishwasher",
    dishwasherLoadsWeek: 5,
    cookingLitresPerPerson: 4,
    cleaningLitresDay: 10,
    gardenMinutesDay: 0,
  });
  const [logging, setLogging] = useState(false);

  /* manual log form */
  const [logForm, setLogForm] = useState(() => ({
    activity: "shower" as WaterActivity,
    liters: "",
    date: new Date().toISOString().slice(0, 10),
  }));
  const [logBusy, setLogBusy] = useState(false);

  /* rainwater harvesting */
  const [rainCityId, setRainCityId] = useState("delhi");
  const [roofArea, setRoofArea] = useState(100);
  const [catchment, setCatchment] = useState<CatchmentId>("metal");
  const rainCity = CITIES.find((c) => c.id === rainCityId) ?? CITIES[0];
  const rain = useAsync<RainResponse>(() => api(`/api/env/rain?lat=${rainCity.lat}&lng=${rainCity.lng}`), [rainCity.lat, rainCity.lng]);

  useEffect(() => {
    if (water.error) {
      toast({ title: "Could not load water data", description: water.error, variant: "destructive" });
    }
  }, [water.error]);

  useEffect(() => {
    if (rain.error) {
      toast({ title: "Could not load rainfall data", description: rain.error, variant: "destructive" });
    }
  }, [rain.error]);

  const summary = water.data?.summary ?? null;

  /* ------------------------- calculator arithmetic ------------------------- */
  const showerL = calc.people * calc.showersPerPerson * calc.showerMinutes * SHOWER_FLOW_L_MIN;
  const toiletL = calc.people * calc.toiletFlushesPerPerson * TOILET_FLUSH_L;
  const laundryL = (calc.laundryLoadsWeek * LAUNDRY_LOAD_L) / 7;
  const dishesL =
    calc.dishMethod === "basin"
      ? HAND_BASIN_L_DAY
      : calc.dishMethod === "running"
        ? RUNNING_TAP_L_DAY
        : (calc.dishwasherLoadsWeek * DISHWASHER_CYCLE_L) / 7;
  const cookingL = calc.people * calc.cookingLitresPerPerson;
  const cleaningL = calc.cleaningLitresDay;
  const gardenL = calc.gardenMinutesDay * HOSE_L_MIN;
  const householdDay = showerL + toiletL + laundryL + dishesL + cookingL + cleaningL + gardenL;
  const perPersonDay = calc.people > 0 ? householdDay / calc.people : householdDay;

  const breakdown = [
    { activity: "shower", label: "Showers", litres: showerL },
    { activity: "toilet", label: "Toilet", litres: toiletL },
    { activity: "laundry", label: "Laundry", litres: laundryL },
    { activity: "dishes", label: "Dishwashing", litres: dishesL },
    { activity: "cooking", label: "Cooking + drinking", litres: cookingL },
    { activity: "cleaning", label: "Cleaning", litres: cleaningL },
    { activity: "garden", label: "Garden", litres: gardenL },
  ];

  async function logEstimate() {
    const entries = breakdown
      .filter((b) => b.litres > 0)
      .map((b) => ({ activity: b.activity, liters: b.litres }));
    if (entries.length === 0) {
      toast({ title: "Nothing to log", description: "Every activity computes to zero litres.", variant: "destructive" });
      return;
    }
    setLogging(true);
    try {
      for (const entry of entries) {
        await api("/api/water", { method: "POST", body: JSON.stringify(entry) });
      }
      toast({ title: "Estimate logged", description: `${entries.length} activit${entries.length === 1 ? "y" : "ies"} recorded for today.` });
      water.refetch();
    } catch (e) {
      toast({ title: "Could not log estimate", description: e instanceof Error ? e.message : "Try again", variant: "destructive" });
    } finally {
      setLogging(false);
    }
  }

  async function submitManualLog(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const liters = Number(logForm.liters);
    if (!Number.isFinite(liters) || liters <= 0) {
      toast({ title: "Invalid volume", description: "Enter a volume greater than 0 litres.", variant: "destructive" });
      return;
    }
    setLogBusy(true);
    try {
      await api("/api/water", {
        method: "POST",
        body: JSON.stringify({ activity: logForm.activity, liters, date: logForm.date || undefined }),
      });
      toast({ title: "Usage logged", description: `${liters} L of ${logForm.activity}.` });
      setLogForm((p) => ({ ...p, liters: "" }));
      water.refetch();
    } catch (err) {
      toast({ title: "Could not log usage", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    } finally {
      setLogBusy(false);
    }
  }

  /* ------------------------------ rain results ----------------------------- */
  const runoff = CATCHMENT_TYPES.find((c) => c.id === catchment)?.coefficient ?? 0.9;
  const harvestL = rain.data && roofArea > 0 ? roofArea * runoff * rain.data.totalMm : null;
  const harvestM3 = harvestL !== null ? harvestL / 1000 : null;
  const daysOfUse =
    harvestL !== null && summary && summary.avgPerDay !== null && summary.avgPerDay > 0
      ? harvestL / summary.avgPerDay
      : null;
  const windowLabel =
    rain.data && rain.data.monthly.length > 0
      ? `${rain.data.monthly[0].month} → ${rain.data.monthly[rain.data.monthly.length - 1].month}`
      : "—";
  const monthlyBars = (rain.data?.monthly ?? []).map((m) => ({
    label: `${m.month.slice(5)}/${m.month.slice(2, 4)}`,
    value: m.totalMm,
  }));

  const activityBars = summary
    ? Object.entries(summary.byActivity).map(([label, value]) => ({ label, value }))
    : [];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6">
      {/* ------------------------------- header ------------------------------ */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          <Droplets className="h-4 w-4" /> Water stewardship
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Water Tracker</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Estimate your household water use from daily habits, log real consumption, and size a rainwater-harvesting
          setup against 12 months of observed rainfall for your city.
        </p>
        <IntegrityNote>
          Water totals come from your own logs; calculator results use the documented typical values shown beside each
          input. Emissions use the published supply + treatment factor — estimates for awareness, never metered
          measurements.
        </IntegrityNote>
      </div>

      {water.error && !water.loading && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {water.error}
        </div>
      )}

      {/* --------------------------- summary tiles --------------------------- */}
      {water.loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
      ) : (
        summary && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label="Last 7 days"
              value={fmtNum(summary.total7Days, 0)}
              unit="L"
              icon={<Droplets className="h-4 w-4" />}
              badge={<DataBadge kind="self-reported" />}
              sub="Your logged volumes over the last week."
            />
            <StatTile
              label="Last 30 days"
              value={fmtNum(summary.total30Days, 0)}
              unit="L"
              badge={<DataBadge kind="self-reported" />}
              sub="Your logged volumes over the last month."
            />
            <StatTile
              label="Average per day"
              value={fmtNum(summary.avgPerDay, 0)}
              unit="L / day"
              badge={<DataBadge kind="estimate" />}
              sub="30-day total spread evenly across 30 days."
            />
            <StatTile
              label="Supply + treatment emissions"
              value={fmtNum(summary.co2eKg30Days, 2)}
              unit="kgCO2e (30d)"
              badge={<DataBadge kind="estimate" />}
              sub={summary.method}
            />
          </div>
        )
      )}

      {/* ------------------- calculator | manual log + recent ---------------- */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <GlassCard className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Calculator className="h-4 w-4 text-accent" /> Estimate my household water use
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumField
                label="People in household"
                value={calc.people}
                onChange={(v) => setCalc((p) => ({ ...p, people: Math.max(1, Math.round(v)) }))}
                min={1}
                max={20}
                unit="people"
              />
              <NumField
                label="Showers per person per day"
                value={calc.showersPerPerson}
                onChange={(v) => setCalc((p) => ({ ...p, showersPerPerson: v }))}
                unit="showers"
                hint="Household showers/day = people × this count."
              />
              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Shower minutes per shower</Label>
                  <span className="font-mono text-sm text-accent">{calc.showerMinutes} min</span>
                </div>
                <Slider
                  value={[calc.showerMinutes]}
                  onValueChange={([v]) => setCalc((p) => ({ ...p, showerMinutes: v }))}
                  min={0}
                  max={30}
                  step={1}
                />
                <p className="text-[11px] text-muted-foreground/80">Typical shower flow ≈ {SHOWER_FLOW_L_MIN} L/min.</p>
              </div>
              <NumField
                label="Toilet flushes per person per day"
                value={calc.toiletFlushesPerPerson}
                onChange={(v) => setCalc((p) => ({ ...p, toiletFlushesPerPerson: v }))}
                unit="flushes"
                hint={`≈ ${TOILET_FLUSH_L} L per flush (typical cistern).`}
              />
              <NumField
                label="Laundry loads per week"
                value={calc.laundryLoadsWeek}
                onChange={(v) => setCalc((p) => ({ ...p, laundryLoadsWeek: v }))}
                unit="loads"
                hint={`≈ ${LAUNDRY_LOAD_L} L per machine load (typical).`}
              />
              <div className="space-y-1.5">
                <Label className="text-xs">Dishwashing method</Label>
                <Select value={calc.dishMethod} onValueChange={(v) => setCalc((p) => ({ ...p, dishMethod: v as typeof calc.dishMethod }))}>
                  <SelectTrigger aria-label="Dishwashing method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basin">Hand basin — ~{HAND_BASIN_L_DAY} L/day per household</SelectItem>
                    <SelectItem value="running">Running tap — ~{RUNNING_TAP_L_DAY} L/day per household</SelectItem>
                    <SelectItem value="dishwasher">Dishwasher — ~{DISHWASHER_CYCLE_L} L per cycle</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground/80">Documented typical values shown beside each option.</p>
              </div>
              {calc.dishMethod === "dishwasher" && (
                <NumField
                  label="Dishwasher loads per week"
                  value={calc.dishwasherLoadsWeek}
                  onChange={(v) => setCalc((p) => ({ ...p, dishwasherLoadsWeek: v }))}
                  unit="loads"
                  hint={`≈ ${DISHWASHER_CYCLE_L} L per cycle.`}
                />
              )}
              <NumField
                label="Cooking + drinking"
                value={calc.cookingLitresPerPerson}
                onChange={(v) => setCalc((p) => ({ ...p, cookingLitresPerPerson: v }))}
                unit="L / person / day"
                hint="Default 4 L/person/day; logged together as cooking."
              />
              <NumField
                label="Cleaning"
                value={calc.cleaningLitresDay}
                onChange={(v) => setCalc((p) => ({ ...p, cleaningLitresDay: v }))}
                unit="L / day"
                hint="Default 10 L/day for mopping and household cleaning."
              />
              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Garden watering minutes per day</Label>
                  <span className="font-mono text-sm text-accent">{calc.gardenMinutesDay} min</span>
                </div>
                <Slider
                  value={[calc.gardenMinutesDay]}
                  onValueChange={([v]) => setCalc((p) => ({ ...p, gardenMinutesDay: v }))}
                  min={0}
                  max={120}
                  step={5}
                />
                <p className="text-[11px] text-muted-foreground/80">Hose ≈ {HOSE_L_MIN} L/min.</p>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-background/40 p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Daily breakdown (household)
              </p>
              <ul className="grid gap-1.5 text-xs sm:grid-cols-2">
                {breakdown.map((b) => (
                  <li key={b.label} className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">{b.label}</span>
                    <span className="font-mono">{fmtNum(b.litres, 0)} L</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={() => void logEstimate()}
              disabled={logging}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/85"
            >
              {logging ? "Logging..." : "Log today's estimate"}
            </Button>
          </GlassCard>

          <div className="grid gap-4 sm:grid-cols-2">
            <StatTile
              label="Per person"
              value={fmtNum(perPersonDay, 0)}
              unit="L / day"
              badge={<DataBadge kind="estimate" />}
              sub="Household estimate divided by people."
            />
            <StatTile
              label="Household"
              value={fmtNum(householdDay, 0)}
              unit="L / day"
              badge={<DataBadge kind="estimate" />}
              sub="Sum of the documented typical values above."
            />
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <GlassCard className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Droplets className="h-4 w-4 text-accent" /> Log water usage
            </h3>
            <form className="space-y-4" onSubmit={submitManualLog}>
              <div className="space-y-1.5">
                <Label>Activity</Label>
                <Select
                  value={logForm.activity}
                  onValueChange={(v) => setLogForm((p) => ({ ...p, activity: v as WaterActivity }))}
                >
                  <SelectTrigger aria-label="Water activity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WATER_ACTIVITIES.map((a) => (
                      <SelectItem key={a} value={a} className="capitalize">
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="wa-liters">Litres</Label>
                  <Input
                    id="wa-liters"
                    type="number"
                    min={0}
                    step="any"
                    value={logForm.liters}
                    placeholder="0"
                    className="font-mono"
                    onChange={(e) => setLogForm((p) => ({ ...p, liters: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="wa-date">Date</Label>
                  <Input
                    id="wa-date"
                    type="date"
                    value={logForm.date}
                    onChange={(e) => setLogForm((p) => ({ ...p, date: e.target.value }))}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/85"
                disabled={logBusy}
              >
                {logBusy ? "Logging..." : "Log entry"}
              </Button>
            </form>
          </GlassCard>

          <GlassCard className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <History className="h-4 w-4 text-primary" /> Recent logs
            </h3>
            {water.loading ? (
              <Skeleton className="h-20 w-full rounded-xl" />
            ) : (water.data?.logs.length ?? 0) === 0 ? (
              <p className="text-xs text-muted-foreground">Nothing logged yet — your entries will appear here.</p>
            ) : (
              <div className="scroll-slim max-h-64 space-y-2 overflow-y-auto pr-1">
                {(water.data?.logs ?? []).map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/40 px-3 py-2 text-xs"
                  >
                    <span className="capitalize text-foreground/90">{l.activity}</span>
                    <span className="font-mono text-muted-foreground">
                      {fmtNum(l.liters, 0)} L · {l.date.slice(0, 10)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* --------------------- activity chart | leak guide -------------------- */}
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="space-y-3">
          <h3 className="text-sm font-semibold">Use by activity (30-day window)</h3>
          {water.loading ? (
            <Skeleton className="h-44 w-full rounded-xl" />
          ) : activityBars.length > 0 ? (
            <BarChart data={activityBars} />
          ) : (
            <EmptyState title="No usage logged yet" hint="Log an entry or save today's estimate to see the split." />
          )}
        </GlassCard>
        <GlassCard className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Wrench className="h-4 w-4 text-primary" /> Leak prevention
          </h3>
          <ul className="space-y-2.5">
            {LEAK_GUIDANCE.map((g) => (
              <li key={g.title} className="rounded-xl border border-border/60 bg-background/40 p-3 text-xs leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground/85">{g.title}:</span> {g.body}
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-muted-foreground/80">Guidance for awareness — not measurements.</p>
        </GlassCard>
      </div>

      {/* ------------------- rainwater harvesting calculator ------------------ */}
      <GlassCard className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <CloudRain className="h-4 w-4 text-accent" /> Rainwater harvesting potential
          </h3>
          <DataBadge kind="historical" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">City</Label>
              <Select value={rainCityId} onValueChange={setRainCityId}>
                <SelectTrigger aria-label="City for rainfall data">
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
            <NumField
              label="Roof catchment area"
              value={roofArea}
              onChange={(v) => setRoofArea(v)}
              unit="m²"
              hint="Plan-view footprint of the roof that drains to your storage."
            />
            <div className="space-y-1.5">
              <Label className="text-xs">Catchment surface</Label>
              <Select value={catchment} onValueChange={(v) => setCatchment(v as CatchmentId)}>
                <SelectTrigger aria-label="Catchment surface type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATCHMENT_TYPES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label} — runoff coefficient {c.coefficient}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="rounded-xl border border-chart-3/25 bg-chart-3/[0.06] px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
              Runoff harvest = roof area × runoff coefficient × rainfall (mm). Does not include first-flush losses,
              filter efficiency or storage constraints.
            </p>
          </div>
          <div className="space-y-4">
            {rain.loading ? (
              <Skeleton className="h-64 w-full rounded-xl" />
            ) : rain.error ? (
              <EmptyState title="Rainfall data unavailable" hint={rain.error} />
            ) : (
              rain.data && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-muted-foreground">
                      Window: <span className="font-mono text-foreground/80">{windowLabel}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Total: <span className="font-mono text-foreground/80">{fmtNum(rain.data.totalMm, 0)} mm</span>
                    </span>
                  </div>
                  <BarChart data={monthlyBars} valueFormat={(v) => `${v.toFixed(0)}mm`} height={150} />
                  {harvestL !== null ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-border/60 bg-background/40 p-3">
                        <p className="text-xs text-muted-foreground">Estimated annual collection ({rainCity.name})</p>
                        <p className="font-mono text-2xl font-semibold text-gradient-eco">{fmtNum(harvestL, 0)} L</p>
                        <p className="text-xs text-muted-foreground">= {fmtNum(harvestM3, 1)} m³</p>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-background/40 p-3">
                        <p className="text-xs text-muted-foreground">Compared with your logged use</p>
                        {daysOfUse !== null ? (
                          <>
                            <p className="font-mono text-2xl font-semibold text-gradient-eco">
                              ≈ {Math.round(daysOfUse).toLocaleString("en-IN")} days
                            </p>
                            <p className="text-xs text-muted-foreground">of your household use</p>
                          </>
                        ) : (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Log some water use to see how many days this would cover.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Enter a roof area above 0 m² to compute collection.</p>
                  )}
                  <SourcePanel
                    provenance={rain.data.provenance}
                    extra={[
                      { label: "Methodology", value: rain.data.analytics.methodology },
                      ...rain.data.analytics.limitations.map((l) => ({ label: "Limitation", value: l })),
                    ]}
                  />
                </>
              )
            )}
          </div>
        </div>
      </GlassCard>

      {/* -------------------------- recommendations --------------------------- */}
      <GlassCard className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Lightbulb className="h-4 w-4 text-chart-4" /> Water-saving recommendations
        </h3>
        <p className="text-xs text-muted-foreground">
          Qualitative best practice only — no invented savings percentages. Your meter tells the truth.
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {SAVING_TIPS.map((t) => (
            <div key={t.title} className="rounded-xl border border-border/60 bg-background/40 p-3 text-xs leading-relaxed">
              <p className="font-medium text-foreground/85">{t.title}</p>
              <p className="mt-1 text-muted-foreground">{t.body}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
