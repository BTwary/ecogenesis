"use client";

import { useEffect, useMemo, useState } from "react";
import { BatteryCharging, Flame, Leaf, PiggyBank, Sun, Timer, Waves, Wind, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard, DataBadge, StatTile, SectionHeading, BarChart, IntegrityNote, EmptyState, SourcePanel } from "./ui-kit";
import { api, useAsync, fmtNum } from "@/lib/client";
import { toast } from "@/hooks/use-toast";
import { CITIES } from "./city-list";

/* ---------------------------------- types --------------------------------- */

interface SolarPoint {
  month: string;
  value: number;
}

interface SolarProvenance {
  providerName: string;
  datasetId: string;
  sourceUrl?: string;
  licence?: string;
  retrievedAt: string;
  cached?: boolean;
  stale?: boolean;
  notes?: string;
  warning?: string;
}

interface SolarResponse {
  location: { lat: number; lng: number };
  monthlyGhi: (SolarPoint | null)[];
  annualMeanGhi: number | null;
  provenance: SolarProvenance;
}

/* --------------------------- renewable explorer ---------------------------- */

const RENEWABLES = [
  {
    icon: Sun,
    title: "Solar",
    body: "Converts sunlight to electricity via photovoltaic panels. Output depends on local irradiance (see the NASA climatology calculator below), panel orientation and shading.",
  },
  {
    icon: Wind,
    title: "Wind",
    body: "Suitability depends on the local wind resource; small turbines only make sense with consistent wind speeds and local permits.",
  },
  {
    icon: Waves,
    title: "Hydroelectric",
    body: "Generates electricity from flowing water, from large dams down to micro-hydro on small streams. It is extremely site-dependent: reliable flow, available head and ecological flow requirements decide viability.",
  },
  {
    icon: Flame,
    title: "Geothermal",
    body: "Draws on steady underground heat. Ground-source heat pumps can provide heating and cooling almost anywhere, while electricity generation needs special high-temperature geology; drilling dominates the cost.",
  },
  {
    icon: Leaf,
    title: "Biomass",
    body: "Converts organic material — crop residues, food and farm waste, biogas — into heat or power. Its climate value depends strongly on the feedstock: waste-derived biogas is generally beneficial, dedicated crops are more ambiguous.",
  },
  {
    icon: BatteryCharging,
    title: "Battery storage",
    body: "Stores surplus generation for later use. Paired with solar it shifts your own generation into evening hours and provides outage backup — see the note below on when it makes financial sense.",
  },
];

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/* --------------------------------- component ------------------------------- */

export default function EnergyView() {
  const [cityId, setCityId] = useState("delhi");
  const [systemKwp, setSystemKwp] = useState(3);
  const [performanceRatio, setPerformanceRatio] = useState(0.78);
  const [tariff, setTariff] = useState(8);
  const [costPerKwp, setCostPerKwp] = useState(55000);

  const city = CITIES.find((c) => c.id === cityId) ?? CITIES[0];
  const solar = useAsync<SolarResponse>(() => api(`/api/env/solar?lat=${city.lat}&lng=${city.lng}`), [city.lat, city.lng]);

  useEffect(() => {
    if (solar.error) {
      toast({ title: "Could not load solar data", description: solar.error, variant: "destructive" });
    }
  }, [solar.error]);

  const ghi = solar.data?.annualMeanGhi ?? null;

  const calc = useMemo(() => {
    if (ghi === null || !Number.isFinite(ghi)) return null;
    const annualGeneration = ghi * performanceRatio * 365 * systemKwp;
    const annualSavings = annualGeneration * tariff;
    const paybackYears = annualSavings > 0 ? (systemKwp * costPerKwp) / annualSavings : null;
    const co2AvoidedT = (annualGeneration * 0.713) / 1000;
    return {
      annualGeneration,
      annualSavings,
      paybackYears,
      co2AvoidedT,
      lifetime25Savings: annualSavings * 25,
      co2Lifetime: co2AvoidedT * 25,
    };
  }, [ghi, performanceRatio, systemKwp, tariff, costPerKwp]);

  const ghiBars = (solar.data?.monthlyGhi ?? [])
    .filter((m): m is SolarPoint => m !== null)
    .map((m) => ({ label: m.month, value: m.value }));

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6">
      {/* ------------------------------- header ------------------------------ */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          <Zap className="h-4 w-4" /> Energy transition
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Renewable Energy</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Explore the main renewable options and size a rooftop solar system against NASA&apos;s 22-year satellite
          climatology — real long-term irradiance data, with every assumption shown in the open.
        </p>
        <IntegrityNote />
      </div>

      {/* ------------------------- renewable explorer ------------------------- */}
      <section className="space-y-4">
        <SectionHeading
          eyebrow="Technology overview"
          title="Renewable options, honestly described"
          description="Qualitative, factual descriptions only — we do not quote global capacity factors or percentages, because they vary enormously by site, technology and installation quality."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RENEWABLES.map((r) => (
            <GlassCard key={r.title} hover className="space-y-2.5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
                  <r.icon className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-semibold">{r.title}</h3>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{r.body}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ---------------------- solar potential calculator -------------------- */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHeading
            eyebrow="NASA POWER 22-year climatology"
            title="Solar potential calculator"
            description="Real 22-year satellite irradiance for the city you pick, combined with your system assumptions. Every formula and assumption is printed below the results."
          />
          <DataBadge kind="historical" label="NASA 22-YR DATA" />
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* inputs */}
          <GlassCard className="space-y-5 lg:col-span-2">
            <div className="space-y-1.5">
              <Label className="text-xs">City</Label>
              <Select value={cityId} onValueChange={setCityId}>
                <SelectTrigger aria-label="City for solar data">
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
              <p className="text-[11px] text-muted-foreground/80">
                Irradiance is looked up at the nearest NASA POWER grid cell to the city centre.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">System size</Label>
                <span className="font-mono text-sm text-accent">{systemKwp.toFixed(1)} kWp</span>
              </div>
              <Slider
                value={[systemKwp]}
                onValueChange={([v]) => setSystemKwp(v)}
                min={1}
                max={10}
                step={0.5}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Performance ratio</Label>
                <span className="font-mono text-sm text-accent">{performanceRatio.toFixed(2)}</span>
              </div>
              <Slider
                value={[performanceRatio]}
                onValueChange={([v]) => setPerformanceRatio(v)}
                min={0.65}
                max={0.85}
                step={0.01}
              />
              <p className="text-[11px] text-muted-foreground/80">
                Accounts for inverter, wiring, soiling and temperature losses.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Electricity tariff</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={tariff === 0 ? "" : String(tariff)}
                    onChange={(e) => setTariff(Math.max(0, Number(e.target.value) || 0))}
                    className="font-mono"
                    aria-label="Electricity tariff in rupees per kWh"
                  />
                  <span className="shrink-0 text-xs text-muted-foreground">₹/kWh</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Installed cost</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={costPerKwp === 0 ? "" : String(costPerKwp)}
                    onChange={(e) => setCostPerKwp(Math.max(0, Number(e.target.value) || 0))}
                    className="font-mono"
                    aria-label="Installed cost in rupees per kWp"
                  />
                  <span className="shrink-0 text-xs text-muted-foreground">₹/kWp</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* results */}
          <div className="space-y-4 lg:col-span-3">
            {solar.loading ? (
              <Skeleton className="h-80 w-full rounded-2xl" />
            ) : ghi === null || !calc ? (
              <EmptyState
                title="No solar climatology available for this location"
                hint="Try another city, or check the data-source panel — the provider may be temporarily unreachable."
              />
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <StatTile
                    label="Annual generation"
                    value={fmtNum(calc.annualGeneration, 0)}
                    unit="kWh / year"
                    badge={<DataBadge kind="estimate" />}
                    sub={`Annual mean GHI ${ghi.toFixed(2)} kWh/m²/day × PR ${performanceRatio.toFixed(2)} × 365 × ${systemKwp.toFixed(1)} kWp`}
                  />
                  <StatTile
                    label="Indicative gross bill value"
                    value={inr(calc.annualSavings)}
                    unit="₹ / year"
                    icon={<PiggyBank className="h-4 w-4" />}
                    badge={<DataBadge kind="estimate" />}
                    sub={`25-year lifetime ≈ ${inr(calc.lifetime25Savings)} (tariff held constant)`}
                  />
                  <StatTile
                    label="Simple payback estimate"
                    value={calc.paybackYears === null ? "—" : calc.paybackYears.toFixed(1)}
                    unit="years"
                    icon={<Timer className="h-4 w-4" />}
                    badge={<DataBadge kind="estimate" />}
                    sub="Installed cost ÷ annual savings. Enter a tariff above 0 to compute."
                  />
                  <StatTile
                    label="Potential grid CO2 displacement"
                    value={fmtNum(calc.co2AvoidedT, 2)}
                    unit="tCO2 / year"
                    icon={<Leaf className="h-4 w-4" />}
                    badge={<DataBadge kind="estimate" />}
                    sub={`Illustrative displacement estimate using 0.713 kgCO2e/kWh (CEA v21.0); not a marginal-emissions calculation · 25-year extrapolation ≈ ${fmtNum(calc.co2Lifetime, 1)} t`}
                  />
                </div>

                <GlassCard className="space-y-3">
                  <h3 className="text-sm font-semibold">Monthly GHI (kWh/m²/day)</h3>
                  {ghiBars.length > 0 ? (
                    <BarChart data={ghiBars} valueFormat={(v) => v.toFixed(1)} height={180} />
                  ) : (
                    <EmptyState title="No monthly values" hint="The climatology response contained no usable months." />
                  )}
                </GlassCard>

                <div className="rounded-xl border border-border/60 bg-background/40 p-4 text-xs leading-relaxed text-muted-foreground">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-foreground/70">
                    Assumptions &amp; exact arithmetic
                  </p>
                  <ul className="space-y-1.5 font-mono">
                    <li>annual generation = annual mean GHI × performance ratio × 365 × system size (kWh)</li>
                    <li>gross bill-value proxy = annual generation × entered tariff (₹/kWh)</li>
                    <li>payback = (system size × installed cost ₹/kWp) ÷ annual savings</li>
                    <li>potential grid CO2 displacement = annual generation × 0.713 kgCO2/kWh — India average grid factor from CEA v21.0; this is not a marginal or project-specific emissions factor</li>
                  </ul>
                  <ul className="mt-2.5 space-y-1.5">
                    <li>
                      Performance ratio (default 0.78) accounts for inverter, wiring, soiling and temperature losses.
                    </li>
                    <li>
                      The bill-value proxy assumes all generated electricity offsets purchases at the entered tariff. Self-consumption, export compensation, fixed charges, degradation, maintenance and financing are not modelled; actual savings can be lower.
                    </li>
                    <li>
                      NASA POWER 22-year climatology at the nearest ~0.5° grid cell — real long-term data, but local
                      micro-effects (shading, exact roof orientation) are NOT modelled.
                    </li>
                    <li>
                      25-year panel-life assumption: lifetime savings = annual savings × 25 and lifetime CO2 =
                      annual CO2 × 25, with your tariff held constant (real tariffs change).
                    </li>
                    <li>Tariff and installed cost are your inputs — the defaults are illustrative, not quotations.</li>
                  </ul>
                </div>

                <SourcePanel provenance={solar.data.provenance} />

                <IntegrityNote>
                  Estimates from published climatology and your assumptions — a site survey by a qualified installer
                  is required before any investment decision.
                </IntegrityNote>
              </>
            )}
          </div>
        </div>
      </section>

      {/* --------------------------- battery note ----------------------------- */}
      <GlassCard className="space-y-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <BatteryCharging className="h-4 w-4 text-primary" /> When does battery storage make sense?
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The value of a home battery depends on your tariff structure, how often outages occur, and your net-metering
          rules — there is no universal number that applies to every home. Paired with solar, a battery shifts your
          own generation into the evening, provides backup during outages and can reduce peak imports; where tariffs
          are low and outages are rare, it rarely pays back on savings alone. Pair it with solar to shift usage, but
          check your utility tariff and local net-metering rules before deciding.
        </p>
      </GlassCard>
    </div>
  );
}
