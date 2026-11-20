"use client";

import { useMemo, useState } from "react";
import {
  Calculator,
  Car,
  BookOpen,
  ChevronDown,
  Flame,
  Leaf,
  ShoppingBag,
  Trash2,
  Droplets,
  Save,
  History,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard, DataBadge, StatTile, Donut, BarChart, Sparkline, IntegrityNote, EmptyState, SourcePanel, CHART_COLORS } from "./ui-kit";
import { api, useAsync, fmtNum, fmtDate } from "@/lib/client";
import { toast } from "@/hooks/use-toast";
import { FACTOR_SOURCES_SUMMARY, METHODOLOGY_NOTE } from "@/lib/factors";

interface FootprintResult {
  totalKg: number;
  perPersonKg: number;
  householdSize: number;
  allocationNote: string;
  categories: { key: string; label: string; kgCo2e: number; detail: string[] }[];
  benchmarks: { india: { value: number; source: string }; world: { value: number; source: string } };
  methodology: string;
}

interface SavedResult {
  id: string;
  totalKgCo2e: number;
  categories: { key: string; label: string; kgCo2e: number }[];
  createdAt: string;
  recalculatedForAllocation?: boolean;
  factorSnapshotAvailable?: boolean;
}

const defaultInputs = {
  carType: "petrol",
  carKmWeek: 0,
  twoWheelerKmWeek: 0,
  busKmWeek: 0,
  trainKmWeek: 0,
  shortFlightsYear: 0,
  longFlightsYear: 0,
  electricityKwhMonth: 150,
  grid: "india",
  customGridFactor: 0.713,
  lpgCylindersMonth: 1,
  pngKwhMonth: 0,
  diet: "medium_meat",
  foodWaste: "moderate",
  clothingItemsYear: 8,
  phonesYear: 0,
  laptopsYear: 0,
  landfillKgWeek: 2,
  recycledKgWeek: 2,
  compostedKgWeek: 0,
  waterLitresDay: 405,
  householdSize: 3,
};

function NumField({
  label,
  value,
  onChange,
  unit,
  hint,
  max = 100000,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit: string;
  hint?: string;
  max?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={0}
          max={max}
          value={value === 0 ? "" : String(value)}
          placeholder="0"
          onChange={(e) => onChange(Math.min(max, Math.max(0, Number(e.target.value) || 0)))}
          className="font-mono"
        />
        <span className="w-28 shrink-0 text-xs text-muted-foreground">{unit}</span>
      </div>
      {hint && <p className="text-[11px] text-muted-foreground/80">{hint}</p>}
    </div>
  );
}

export default function FootprintView() {
  const [inputs, setInputs] = useState({ ...defaultInputs });
  const [result, setResult] = useState<FootprintResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [openDetail, setOpenDetail] = useState<string | null>(null);
  const history = useAsync<{ results: SavedResult[] }>(() => api("/api/footprint"), []);

  const set = <K extends keyof typeof inputs>(k: K, v: (typeof inputs)[K]) => setInputs((p) => ({ ...p, [k]: v }));

  async function calculate(save: boolean) {
    setCalculating(true);
    try {
      const res = await api<{ result: FootprintResult }>("/api/footprint", {
        method: "POST",
        body: JSON.stringify({ ...inputs, save }),
      });
      setResult(res.result);
      if (save) {
        history.refetch();
        toast({ title: "Calculation saved", description: "Stored with a factor snapshot for traceability." });
      }
    } catch (e) {
      toast({ title: "Calculation failed", description: e instanceof Error ? e.message : "Try again", variant: "destructive" });
    } finally {
      setCalculating(false);
    }
  }

  const topCategories = useMemo(
    () => (result ? [...result.categories].sort((a, b) => b.kgCo2e - a.kgCo2e) : []),
    [result],
  );

  const trend = (history.data?.results ?? []).slice(0, 12).map((r) => r.totalKgCo2e).reverse();

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6">
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          <Calculator className="h-4 w-4" /> Personal carbon footprint
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">My Footprint</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Enter what you know; leave the rest at zero. Every result is computed from published emission factors with the
          full arithmetic shown, so you can verify or challenge any number. Results are estimates for awareness and
          planning — never presented as measurements.
        </p>
        <IntegrityNote>{METHODOLOGY_NOTE}</IntegrityNote>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* ------------------------------ INPUTS ------------------------------ */}
        <div className="lg:col-span-3">
          <GlassCard className="space-y-4">
            <Tabs defaultValue="transport">
              <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
                <TabsTrigger value="transport"><Car className="mr-1 h-3.5 w-3.5" />Travel</TabsTrigger>
                <TabsTrigger value="energy"><Flame className="mr-1 h-3.5 w-3.5" />Energy</TabsTrigger>
                <TabsTrigger value="food"><Leaf className="mr-1 h-3.5 w-3.5" />Food</TabsTrigger>
                <TabsTrigger value="goods"><ShoppingBag className="mr-1 h-3.5 w-3.5" />Goods</TabsTrigger>
                <TabsTrigger value="waste"><Trash2 className="mr-1 h-3.5 w-3.5" />Waste</TabsTrigger>
                <TabsTrigger value="water"><Droplets className="mr-1 h-3.5 w-3.5" />Water</TabsTrigger>
              </TabsList>

              <TabsContent value="transport" className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Primary car fuel type (if any)</Label>
                  <Select value={inputs.carType} onValueChange={(v) => set("carType", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No car</SelectItem>
                      <SelectItem value="petrol">Petrol</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="ev">Electric (grid-charged)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {inputs.carType !== "none" && (
                  <NumField label="Car distance" value={inputs.carKmWeek} onChange={(v) => set("carKmWeek", v)} unit="km / week" />
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <NumField label="Two-wheeler distance" value={inputs.twoWheelerKmWeek} onChange={(v) => set("twoWheelerKmWeek", v)} unit="km / week" />
                  <NumField label="Bus distance" value={inputs.busKmWeek} onChange={(v) => set("busKmWeek", v)} unit="km / week" />
                  <NumField label="Train / metro distance" value={inputs.trainKmWeek} onChange={(v) => set("trainKmWeek", v)} unit="km / week" />
                  <NumField label="Short-haul flights" value={inputs.shortFlightsYear} onChange={(v) => set("shortFlightsYear", v)} unit="round-trips / year" hint="Assumes ~2,200 km per round trip" />
                  <NumField label="Long-haul flights" value={inputs.longFlightsYear} onChange={(v) => set("longFlightsYear", v)} unit="round-trips / year" hint="Assumes ~14,000 km per round trip" />
                </div>
              </TabsContent>

              <TabsContent value="energy" className="space-y-4 pt-4">
                <NumField label="Household electricity" value={inputs.electricityKwhMonth} onChange={(v) => set("electricityKwhMonth", v)} unit="kWh / month" hint="From your utility bill" />
                <div className="space-y-1.5">
                  <Label className="text-xs">Grid emission factor</Label>
                  <Select value={inputs.grid} onValueChange={(v) => set("grid", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="india">India — 0.713 kgCO2e/kWh (CEA v21.0, 2023-24)</SelectItem>
                      <SelectItem value="world">World average — 0.481 kgCO2e/kWh (IEA est.)</SelectItem>
                      <SelectItem value="custom">Custom factor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {inputs.grid === "custom" && (
                  <NumField label="Custom grid factor" value={inputs.customGridFactor} onChange={(v) => set("customGridFactor", v)} unit="kgCO2e/kWh" />
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <NumField label="LPG cylinders" value={inputs.lpgCylindersMonth} onChange={(v) => set("lpgCylindersMonth", v)} unit="14.2 kg / month" />
                  <NumField label="Piped natural gas" value={inputs.pngKwhMonth} onChange={(v) => set("pngKwhMonth", v)} unit="kWh / month" />
                </div>
              </TabsContent>

              <TabsContent value="food" className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Diet archetype</Label>
                  <Select value={inputs.diet} onValueChange={(v) => set("diet", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="heavy_meat">Heavy meat eater — 7.2 tCO2e/yr</SelectItem>
                      <SelectItem value="medium_meat">Medium meat eater — 5.6 tCO2e/yr</SelectItem>
                      <SelectItem value="low_meat">Low meat eater — 4.7 tCO2e/yr</SelectItem>
                      <SelectItem value="vegetarian">Vegetarian — 3.8 tCO2e/yr</SelectItem>
                      <SelectItem value="vegan">Vegan — 2.9 tCO2e/yr</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground/80">Values from Scarborough et al. 2014 (published dietary-GHG study, UK). Regional food systems differ.</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Food-waste adjustment for your diet</Label>
                  <Select value={inputs.foodWaste} onValueChange={(v) => set("foodWaste", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low — we plan meals and use leftovers</SelectItem>
                      <SelectItem value="moderate">Moderate — some food is thrown away</SelectItem>
                      <SelectItem value="high">High — a noticeable share is wasted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="goods" className="space-y-4 pt-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <NumField label="New clothing" value={inputs.clothingItemsYear} onChange={(v) => set("clothingItemsYear", v)} unit="items / year" max={500} />
                  <NumField label="New smartphones" value={inputs.phonesYear} onChange={(v) => set("phonesYear", v)} unit="phones / year" max={20} />
                  <NumField label="New laptops" value={inputs.laptopsYear} onChange={(v) => set("laptopsYear", v)} unit="laptops / year" max={20} />
                </div>
                <p className="text-[11px] text-muted-foreground/80">
                  Product footprints are manufacturer-LCA midpoints (illustrative). Repairs and second-hand purchases
                  avoid most of this — they are how the biggest savings happen.
                </p>
              </TabsContent>

              <TabsContent value="waste" className="space-y-4 pt-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <NumField label="To landfill" value={inputs.landfillKgWeek} onChange={(v) => set("landfillKgWeek", v)} unit="kg / week" />
                  <NumField label="Recycled" value={inputs.recycledKgWeek} onChange={(v) => set("recycledKgWeek", v)} unit="kg / week" />
                  <NumField label="Composted" value={inputs.compostedKgWeek} onChange={(v) => set("compostedKgWeek", v)} unit="kg / week" />
                </div>
                <p className="text-[11px] text-muted-foreground/80">
                  Not sure? Estimate: an average household bag of mixed waste is roughly 5 kg. The Waste module can help
                  you track this properly.
                </p>
              </TabsContent>

              <TabsContent value="water" className="space-y-4 pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Total household water use</Label>
                    <span className="font-mono text-sm text-accent">{inputs.waterLitresDay} L/day</span>
                  </div>
                  <Slider value={[inputs.waterLitresDay]} onValueChange={([v]) => set("waterLitresDay", v)} min={0} max={2000} step={5} />
                  <p className="text-[11px] text-muted-foreground/80">
                    Enter the whole household total. For example, 3 occupants at 135 L/person/day is 405 L/day; this calculator allocates the total evenly.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-1.5 border-t border-border/50 pt-4">
              <Label className="text-xs">People sharing household energy, waste and water</Label>
              <Slider value={[inputs.householdSize]} onValueChange={([v]) => set("householdSize", v)} min={1} max={12} step={1} />
              <p className="text-[11px] text-muted-foreground/80">{inputs.householdSize} occupant{inputs.householdSize > 1 ? "s" : ""} — household electricity, LPG/PNG, waste and water are divided equally. Travel, diet and goods remain personal inputs.</p>
            </div>

            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
              <Button onClick={() => calculate(true)} disabled={calculating} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/85">
                <Save className="mr-2 h-4 w-4" /> {calculating ? "Calculating..." : "Calculate & save"}
              </Button>
              <Button variant="outline" onClick={() => calculate(false)} disabled={calculating} className="flex-1">
                Quick estimate (no save)
              </Button>
            </div>
          </GlassCard>
        </div>

        {/* ------------------------------ RESULTS ------------------------------ */}
        <div className="space-y-4 lg:col-span-2">
          {calculating && <Skeleton className="h-64 w-full rounded-2xl" />}
          {!calculating && !result && (
            <EmptyState
              icon={<Calculator className="h-10 w-10" />}
              title="Your result will appear here"
              hint="Fill in what you know and press Calculate. Categories with zero inputs contribute zero — the calculator never fills gaps with invented numbers."
            />
          )}
          {!calculating && result && (
            <>
              <StatTile
                label="Your estimated footprint"
                value={fmtNum(result.perPersonKg / 1000, 2)}
                unit="tCO2e / person / year"
                badge={<DataBadge kind="estimate" />}
                sub={result.allocationNote}
              />
              <GlassCard className="space-y-4">
                <h3 className="text-sm font-semibold">Your allocated per-person breakdown</h3>
                <Donut
                  segments={topCategories.map((c, i) => ({ label: c.label, value: c.kgCo2e, color: CHART_COLORS[i % CHART_COLORS.length] }))}
                  centerValue={fmtNum(result.perPersonKg / 1000, 1) + "t"}
                  centerLabel="per person / year"
                />
                <BarChart data={topCategories.map((c, i) => ({ label: c.label.split(" ")[0], value: c.kgCo2e / 1000, color: CHART_COLORS[i % CHART_COLORS.length] }))} valueFormat={(v) => `${v.toFixed(1)}t`} height={150} />
                <div className="space-y-2">
                  {topCategories.map((c, i) => (
                    <div key={c.key} className="rounded-xl border border-border/60 bg-background/40">
                      <button
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm"
                        onClick={() => setOpenDetail(openDetail === c.key ? null : c.key)}
                        aria-expanded={openDetail === c.key}
                      >
                        <span className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                          <span className="font-medium">{c.label}</span>
                          {i === 0 && <DataBadge kind="estimate" label="LARGEST" />}
                        </span>
                        <span className="flex items-center gap-2 font-mono text-sm">
                          {fmtNum(c.kgCo2e / 1000, 2)} t
                          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openDetail === c.key ? "rotate-180" : ""}`} />
                        </span>
                      </button>
                      {openDetail === c.key && (
                        <ul className="space-y-1.5 border-t border-border/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                          {c.detail.length === 0 && <li>No inputs in this category — contributes zero.</li>}
                          {c.detail.map((d, j) => (
                            <li key={j} className="font-mono">{d}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="space-y-3">
                <h3 className="text-sm font-semibold">Reference context — not a like-for-like comparison</h3>
                <div className="rounded-xl border border-border/60 bg-background/40 p-3">
                  <p className="text-xs text-muted-foreground">Your allocated estimate (broader consumption CO2e)</p>
                  <p className="mt-1 font-mono text-xl font-semibold">{fmtNum(result.perPersonKg / 1000, 2)} tCO2e/person/year</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border/60 p-3">
                    <p className="text-xs text-muted-foreground">India fossil CO2 reference</p>
                    <p className="mt-1 font-mono text-lg">{fmtNum(result.benchmarks.india.value, 2)} t/person/year</p>
                    <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{result.benchmarks.india.source}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 p-3">
                    <p className="text-xs text-muted-foreground">World fossil CO2 reference</p>
                    <p className="mt-1 font-mono text-lg">{fmtNum(result.benchmarks.world.value, 2)} t/person/year</p>
                    <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{result.benchmarks.world.source}</p>
                  </div>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">These reference figures cover fossil-fuel and industrial CO2 only. Your calculator includes selected CO2e categories such as diet, goods, waste and water. Their boundaries differ, so the values must not be interpreted as a direct performance comparison.</p>
              </GlassCard>

              <GlassCard className="space-y-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold"><Lightbulb className="h-4 w-4 text-chart-4" /> Reduction opportunities</h3>
                <p className="text-xs text-muted-foreground">
                  Prioritised from your two largest categories. Savings ranges come from the same published factors used
                  in the calculation.
                </p>
                <ul className="space-y-2">
                  {topCategories.slice(0, 2).map((c) => (
                    <li key={c.key} className="rounded-xl border border-border/60 bg-background/40 p-3 text-xs leading-relaxed">
                      <span className="font-medium text-foreground/85">{c.label}:</span>{" "}
                      {c.key === "transport" && "Shift short trips to public transport or cycling; combine errands; for EVs the grid factor matters as much as the vehicle."}
                      {c.key === "energy" && "Raise AC setpoints, switch to LED, and consider rooftop solar — the Energy module computes your payback with real NASA data."}
                      {c.key === "food" && "Shift one or two meat-heavy meals per week to plant-based; cut food waste — each diet archetype step is worth ≈0.9 tCO2e/yr in the underlying study."}
                      {c.key === "goods" && "Repair before replacing; buy second-hand; extend device life — manufacturing dominates electronics footprints."}
                      {c.key === "waste" && "Compost organics and recycle more — landfill emits ≈0.47 kgCO2e/kg that composting nearly eliminates."}
                      {c.key === "water" && "Fix leaks and fit aerators; shorter showers cut both water and the energy used to treat it."}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </>
          )}
        </div>
      </div>

      {/* ------------------------------ METHOD + HISTORY ------------------------------ */}
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold"><BookOpen className="h-4 w-4 text-primary" /> Methodology & sources</h3>
          <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
            {FACTOR_SOURCES_SUMMARY.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                {s}
              </li>
            ))}
          </ul>
          <p className="text-[11px] leading-relaxed text-muted-foreground/80">
            DEFRA (UK) conversion factors are widely used international defaults; the India grid factor comes from the
            Central Electricity Authority. A snapshot of every factor used is stored with each saved calculation.
          </p>
        </GlassCard>

        <GlassCard className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold"><History className="h-4 w-4 text-primary" /> Your calculation history</h3>
          {history.data?.results.some((item) => item.recalculatedForAllocation && !item.factorSnapshotAvailable) && (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-[11px] leading-relaxed text-muted-foreground">
              Some older entries had no readable factor snapshot. Those entries were recalculated with the current factors and are not exact historical reproductions.
            </p>
          )}
          {history.data?.results.some((item) => item.recalculatedForAllocation && item.factorSnapshotAvailable) && (
            <p className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-[11px] leading-relaxed text-muted-foreground">
              Older entries have been reallocated to correct the previous household-size calculation while retaining their original saved emission factors.
            </p>
          )}
          {trend.length >= 2 && (
            <div className="flex items-center gap-3">
              <Sparkline points={trend} />
              <span className="text-xs text-muted-foreground">{trend.length} saved per-person estimates · most recent {fmtNum(trend[trend.length - 1] / 1000, 2)} t</span>
            </div>
          )}
          {history.loading ? (
            <Skeleton className="h-24 w-full rounded-xl" />
          ) : (history.data?.results.length ?? 0) === 0 ? (
            <p className="text-xs text-muted-foreground">No saved calculations yet. Save one to start tracking your progress over time.</p>
          ) : (
            <div className="scroll-slim max-h-56 space-y-2 overflow-y-auto pr-1">
              {history.data!.results.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-background/40 px-3 py-2 text-xs">
                  <span className="text-muted-foreground">{fmtDate(r.createdAt, false)}</span>
                  <span className="font-mono font-medium">{fmtNum(r.totalKgCo2e / 1000, 2)} tCO2e/person</span>
                </div>
              ))}
            </div>
          )}
          <SourcePanel
            provenance={{
              providerName: "ECOGENESIS calculation engine",
              datasetId: "published-emission-factors",
              licence: "Factor sources listed above",
              notes: "New results store the exact inputs and factor snapshot used. Older records are reallocated using their original saved factors where available; entries without a readable factor snapshot are marked as recalculated with current factors.",
              retrievedAt: new Date().toISOString(),
            }}
          />
        </GlassCard>
      </div>
    </div>
  );
}
