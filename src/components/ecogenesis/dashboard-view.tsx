"use client";

import { useState } from "react";
import {
  Activity,
  Bird,
  CloudRain,
  Sun,
  Thermometer,
  Wind,
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  XCircle,
  Scale,
  TrendingUp,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GlassCard, DataBadge, SourcePanel, StatTile, SectionHeading, LineChart, BarChart, IntegrityNote, EmptyState, type DataKind } from "./ui-kit";
import { api, useAsync, fmtNum, fmtDate } from "@/lib/client";
import type { ViewKey } from "./app-shell";
import { CITIES } from "./city-list";

interface AirResponse {
  latest: Record<string, { value: number; observedAt: string; stale: boolean } | null>;
  series: Record<string, { t: string; v: number }[]>;
  provenance: { providerName: string; retrievedAt: string | null; cached: boolean; licence: string; sourceUrl: string; notes?: string; warning?: string };
  quality: { newestObservation: string | null };
  groundStations?: {
    openAqStatus: string;
    openAqReadings: { locationId: number; stationName: string; locality: string | null; latitude: number; longitude: number; parameter: string; value: number; unit: string; observedAtUtc: string }[];
    openAqError?: string;
    cpcbStatus: string;
    cpcbCity: string | null;
    cpcbReadings: { station: string; city: string; state: string; pollutant: string; avg: number | null; min: number | null; max: number | null; unit: string; updatedAt: string }[];
    cpcbError?: string;
  };
}

interface ClimateResponse {
  periods: { a: { label: string }; b: { label: string } };
  summary: {
    a: { meanTemperature: number | null; annualPrecipitation: number | null; monthsCovered: number; completeYears: number; monthOfYear: { month: number; temperature: number | null; precipitation: number | null; yearsCovered: number }[] };
    b: { meanTemperature: number | null; annualPrecipitation: number | null; monthsCovered: number; completeYears: number; monthOfYear: { month: number; temperature: number | null; precipitation: number | null; yearsCovered: number }[] };
  };
  monthly: { a: { month: string; temperatureMean: number | null }[]; b: { month: string; temperatureMean: number | null }[] };
  delta: { meanTemperatureShift: number | null; precipitationShiftPercent: number | null } | null;
  analytics: { methodology: string; dataKind: string; confidence: string; limitations: string[] };
  provenance: { providerName: string; retrievedAt: string | null; cached: boolean; warning?: string };
}

interface SolarResponse {
  monthlyGhi: { month: string; value: number }[] | null[];
  annualMeanGhi: number | null;
  provenance: { providerName: string; retrievedAt: string | null; cached: boolean };
}

interface RainResponse {
  monthly: { month: string; totalMm: number | null; daysReported: number; daysExpected: number }[];
  totalMm: number | null;
  analytics: { methodology: string; warnings?: string[] };
  provenance: { providerName: string; retrievedAt: string | null; cached: boolean };
}

interface BioResponse {
  totalCount: number;
  sampledRecords: number;
  speciesCounts: { species: string; count: number; kingdom: string }[];
  analytics: { confidence: string; limitations: string[] };
  provenance: { providerName: string; retrievedAt: string };
}

interface StatusResponse {
  checkedAt: string;
  summary: { operational: number; requiresKey: number; unavailable: number };
  sources: {
    id: string;
    name: string;
    what: string;
    status: "operational" | "requires-key" | "unavailable";
    auth: string;
    updateFrequency: string;
    coverage: string;
    licence: string;
    notes: string;
    endpoints: string[];
    latencyMs?: number;
    lastChecked: string;
  }[];
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function AirParamRow({ label, param, air }: { label: string; param: string; air: AirResponse | null }) {
  const v = air?.latest[param];
  return (
    <div className="flex items-center justify-between border-b border-border/40 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium">
        {v ? `${fmtNum(v.value, 1)} ${param.includes("aqi") ? "" : "µg/m³"}` : "—"}
        {v?.stale && <DataBadge kind="stale" className="ml-2" />}
      </span>
    </div>
  );
}

export default function DashboardView({ navigate }: { navigate: (v: ViewKey) => void }) {
  const [city, setCity] = useState("delhi");
  const [compareCity, setCompareCity] = useState("mumbai");
  const primary = CITIES.find((c) => c.id === city)!;
  const compare = CITIES.find((c) => c.id === compareCity)!;

  const air = useAsync<AirResponse>(async () => {
    const cityParam = primary.cpcbCity ? `&city=${encodeURIComponent(primary.cpcbCity)}` : "";
    const a = await api<AirResponse>(`/api/env/air?lat=${primary.lat}&lng=${primary.lng}${cityParam}`);
    try {
      const compareCityParam = compare.cpcbCity ? `&city=${encodeURIComponent(compare.cpcbCity)}` : "";
      const b = await api<AirResponse>(`/api/env/air?lat=${compare.lat}&lng=${compare.lng}${compareCityParam}`);
      (a as AirResponse & { compare?: AirResponse }).compare = b;
    } catch {
      /* comparison optional */
    }
    return a;
  }, [primary.lat, primary.lng, compare.lat, compare.lng, city, compareCity]);
  const climate = useAsync<ClimateResponse>(() => api(`/api/env/climate?lat=${primary.lat}&lng=${primary.lng}`), [primary.lat, primary.lng]);
  const solar = useAsync<SolarResponse>(() => api(`/api/env/solar?lat=${primary.lat}&lng=${primary.lng}`), [primary.lat, primary.lng]);
  const rain = useAsync<RainResponse>(() => api(`/api/env/rain?lat=${primary.lat}&lng=${primary.lng}`), [primary.lat, primary.lng]);
  const bio = useAsync<BioResponse>(() => api(`/api/env/biodiversity?lat=${primary.lat}&lng=${primary.lng}&radiusKm=25`), [primary.lat, primary.lng]);
  const status = useAsync<StatusResponse>(() => api("/api/env/status"), []);

  const compareAir = (air.data as (AirResponse & { compare?: AirResponse }) | null)?.compare ?? null;
  const pm25 = air.data?.latest.pm2_5?.value ?? null;
  const usAqi = air.data?.latest.us_aqi?.value ?? null;
  const seriesPm25 = air.data?.series.pm2_5 ?? [];
  const airBadge: DataKind = air.data?.provenance.cached ? "cached" : "estimate";

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <SectionHeading
          eyebrow="Environmental intelligence"
          title="Intelligence Dashboard"
          description="Location-grounded indicators from operational providers. Model outputs, reanalysis and climatology are labelled; every panel can be traced to its source. Nothing here is simulated."
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="w-full sm:w-44">
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger aria-label="Primary location">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>{CITIES.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-44">
            <Select value={compareCity} onValueChange={setCompareCity}>
              <SelectTrigger aria-label="Comparison location">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>{CITIES.map((c) => (<SelectItem key={c.id} value={c.id}>vs {c.name}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ------------------------------ STAT ROW ------------------------------ */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label={`PM2.5 · ${primary.name}`}
          value={pm25 === null ? "—" : fmtNum(pm25, 0)}
          unit="µg/m³"
          badge={air.loading ? undefined : <DataBadge kind={airBadge} />}
          icon={<Wind className="h-4 w-4" />}
          sub={air.error ? `Provider unavailable — ${air.error}` : air.data ? `CAMS model estimate · observed ${air.data.quality.newestObservation ? fmtDate(air.data.quality.newestObservation, false) : "timestamp unavailable"}` : "Loading..."}
        />
        <StatTile
          label="US AQI"
          value={usAqi === null ? "—" : fmtNum(usAqi, 0)}
          unit="index"
          badge={air.loading ? undefined : <DataBadge kind={airBadge} />}
          icon={<Activity className="h-4 w-4" />}
          sub={
            usAqi === null
              ? "No valid AQI observation"
              : usAqi <= 100
                ? "≤100: generally acceptable range"
                : usAqi <= 200
                  ? "101-200: sensitive groups affected"
                  : ">200: health risk warning"
          }
        />
        <StatTile
          label={`Mean temp shift · ${climate.data?.periods?.a?.label ?? ""} → ${climate.data?.periods?.b?.label ?? ""}`}
          value={climate.data?.delta?.meanTemperatureShift === null || climate.data === null || climate.data.delta === null || climate.data.delta.meanTemperatureShift === null ? "—" : `${climate.data.delta.meanTemperatureShift > 0 ? "+" : ""}${fmtNum(climate.data.delta.meanTemperatureShift, 2)}`}
          unit="°C"
          badge={<DataBadge kind="historical" />}
          icon={<Thermometer className="h-4 w-4" />}
          sub={climate.loading ? "Computing decadal comparison (ERA5)..." : climate.data ? `${climate.data.analytics.dataKind} · ${climate.data.analytics.confidence.split("(")[0]}` : climate.error ? "Climate data unavailable" : "Loading..."}
        />
        <StatTile
          label={`Solar resource · ${primary.name}`}
          value={solar.data?.annualMeanGhi == null ? "—" : fmtNum(solar.data.annualMeanGhi as number, 2)}
          unit="kWh/m²/day"
          badge={<DataBadge kind="historical" label="CLIMATOLOGY" />}
          icon={<Sun className="h-4 w-4" />}
          sub={solar.data ? "NASA POWER 2001-2023 satellite climatology" : solar.error ? "NASA POWER unavailable" : "Loading..."}
        />
      </div>

      {/* ------------------------------ CHART ROW ------------------------------ */}
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">PM2.5 · last 24 hours</h3>
            <div className="flex items-center gap-2">
              {compareAir?.latest.pm2_5 && (
                <span className="text-xs text-muted-foreground">
                  {compare.name}: <span className="font-mono text-foreground">{fmtNum(compareAir.latest.pm2_5.value, 0)}</span> µg/m³
                </span>
              )}
              <DataBadge kind={airBadge} />
            </div>
          </div>
          {air.loading ? (
            <Skeleton className="h-44 w-full rounded-xl" />
          ) : seriesPm25.length > 1 ? (
            <LineChart
              series={[{ name: "PM2.5", color: "#34d399", points: seriesPm25.map((p) => p.v) }]}
              xLabels={seriesPm25.map((p, i) => (i % 4 === 0 ? `${new Date(p.t).getUTCHours()}:00 UTC` : ""))}
              yLabel="µg/m³"
            />
          ) : (
            <EmptyState icon={<AlertTriangle className="h-8 w-8" />} title="No hourly series available" hint={air.data?.provenance.warning ?? "The provider returned no valid points for this grid cell."} />
          )}
          {air.data?.provenance.warning && (
            <p className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" /> {air.data.provenance.warning}
            </p>
          )}
          <div className="grid grid-cols-2 gap-x-6">
            <AirParamRow label="PM10" param="pm10" air={air.data} />
            <AirParamRow label="Ozone (O3)" param="ozone" air={air.data} />
            <AirParamRow label="Nitrogen dioxide" param="nitrogen_dioxide" air={air.data} />
            <AirParamRow label="Sulphur dioxide" param="sulphur_dioxide" air={air.data} />
          </div>
          <SourcePanel
            provenance={air.data?.provenance}
            extra={[
              { label: "Coverage", value: "Global gridded model interpolated to the selected point" },
              { label: "Comparison source", value: compareAir ? `${compareAir.provenance.providerName} (${compare.name})` : "unavailable" },
            ]}
          />
        </GlassCard>

        <GlassCard className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Temperature climatology · two decades compared</h3>
            <DataBadge kind="historical" />
          </div>
          {climate.loading ? (
            <Skeleton className="h-44 w-full rounded-xl" />
          ) : climate.error || !climate.data ? (
            <EmptyState icon={<AlertTriangle className="h-8 w-8" />} title="Climate archive unavailable" hint={climate.error ?? undefined} />
          ) : (
            <LineChart
              series={[
                { name: climate.data.periods.a.label, color: "#38bdf8", points: MONTH_LABELS.map((_, i) => climate.data!.summary.a.monthOfYear.find((m) => m.month === i + 1)?.temperature ?? NaN) },
                { name: climate.data.periods.b.label, color: "#a3e635", points: MONTH_LABELS.map((_, i) => climate.data!.summary.b.monthOfYear.find((m) => m.month === i + 1)?.temperature ?? NaN) },
              ]}
              xLabels={MONTH_LABELS}
              yLabel="°C mean"
            />
          )}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-chart-3" /> {climate.data?.periods.a.label ?? "1991-2000"}</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-chart-2" /> {climate.data?.periods.b.label ?? "recent decade"}</span>
          </div>
          <SourcePanel provenance={climate.data?.provenance} extra={[{ label: "Methodology", value: climate.data?.analytics.methodology.slice(0, 160) + "..." ?? "" }]} />
        </GlassCard>
      </div>

      {/* ----------------------- GROUND STATION READINGS ----------------------- */}
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Nearby OpenAQ ground stations</h3>
            <DataBadge kind={air.data?.groundStations?.openAqStatus === "available" ? "live" : "estimate"} label={air.data?.groundStations?.openAqStatus === "available" ? "GROUND OBSERVATIONS" : air.data?.groundStations?.openAqStatus === "requires-key" ? "API KEY REQUIRED" : "NO STATION DATA"} />
          </div>
          {air.data?.groundStations?.openAqStatus === "available" ? (
            <div className="scroll-slim max-h-56 space-y-2 overflow-y-auto">
              {air.data.groundStations.openAqReadings.slice(0, 24).map((reading, index) => (
                <div key={`${reading.locationId}-${reading.parameter}-${reading.observedAtUtc}-${index}`} className="flex items-start justify-between gap-3 border-b border-border/40 pb-2 text-xs last:border-0">
                  <div className="min-w-0">
                    <p className="font-medium">{reading.stationName}</p>
                    <p className="text-muted-foreground">{reading.locality ?? "Nearby station"} · {reading.parameter} · {fmtDate(reading.observedAtUtc, false)}</p>
                  </div>
                  <p className="shrink-0 font-mono">{fmtNum(reading.value, 2)} {reading.unit}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">{air.data?.groundStations?.openAqStatus === "requires-key" ? "Configure OPENAQ_API_KEY to retrieve actual nearby station measurements. CAMS model estimates remain separate above." : air.data?.groundStations?.openAqError ?? "No nearby OpenAQ station readings were returned for this location."}</p>
          )}
          <p className="text-[10px] leading-relaxed text-muted-foreground">Station measurements are displayed in the unit supplied by the publisher. They are not merged with gridded CAMS model estimates; licensing and timestamp quality vary by source dataset.</p>
        </GlassCard>
        <GlassCard className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">CPCB station readings · {primary.name}</h3>
            <DataBadge kind={air.data?.groundStations?.cpcbStatus === "available" ? "live" : "estimate"} label={air.data?.groundStations?.cpcbStatus === "available" ? "CPCB RECORDS" : air.data?.groundStations?.cpcbStatus === "requires-key" ? "API KEY REQUIRED" : "NO CITY RECORDS"} />
          </div>
          {air.data?.groundStations?.cpcbStatus === "available" ? (
            <div className="scroll-slim max-h-56 space-y-2 overflow-y-auto">
              {air.data.groundStations.cpcbReadings.slice(0, 24).map((reading, index) => (
                <div key={`${reading.station}-${reading.pollutant}-${index}`} className="flex items-start justify-between gap-3 border-b border-border/40 pb-2 text-xs last:border-0">
                  <div className="min-w-0">
                    <p className="font-medium">{reading.station}</p>
                    <p className="text-muted-foreground">{reading.pollutant} · {reading.city}, {reading.state} · {reading.updatedAt || "timestamp unavailable"}</p>
                  </div>
                  <p className="shrink-0 font-mono">{reading.avg === null ? "—" : fmtNum(reading.avg, 2)} {reading.unit}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">{air.data?.groundStations?.cpcbStatus === "requires-key" ? "Configure DATA_GOV_IN_KEY to retrieve CPCB station records from data.gov.in." : air.data?.groundStations?.cpcbStatus === "city-required" ? "Select an Indian city to request city-filtered CPCB records." : air.data?.groundStations?.cpcbError ?? "No CPCB records were returned for this city."}</p>
          )}
          <p className="text-[10px] leading-relaxed text-muted-foreground">CPCB values are displayed as published by the source dataset. The city filter is not a station-radius search, and this panel does not infer a reading for every map coordinate.</p>
        </GlassCard>
      </div>

      {/* --------------------------- RAIN + SOLAR --------------------------- */}
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold"><CloudRain className="h-4 w-4 text-chart-3" /> Monthly precipitation · last 12 months</h3>
            <DataBadge kind="historical" />
          </div>
          {rain.loading ? (
            <Skeleton className="h-44 w-full rounded-xl" />
          ) : rain.error || !rain.data ? (
            <EmptyState icon={<AlertTriangle className="h-8 w-8" />} title="Precipitation archive unavailable" hint={rain.error ?? undefined} />
          ) : (
            <BarChart data={rain.data.monthly.filter((m) => m.totalMm !== null).map((m) => ({ label: m.month.slice(2), value: m.totalMm as number }))} valueFormat={(v) => `${v.toFixed(0)}mm`} />
          )}
          {rain.data && (
            <p className="text-xs text-muted-foreground">
              Window total: <span className="font-mono text-foreground">{rain.data.totalMm === null ? "—" : fmtNum(rain.data.totalMm, 0)}</span> mm · {rain.data.analytics.methodology.slice(0, 90)}...
            </p>
          )}
          {rain.data?.analytics.warnings?.map((warning, i) => <p key={i} className="text-xs text-destructive">{warning}</p>)}
          <SourcePanel provenance={rain.data?.provenance} />
        </GlassCard>

        <GlassCard className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold"><Sun className="h-4 w-4 text-chart-4" /> Solar irradiance climatology</h3>
            <DataBadge kind="historical" label="NASA 22-YR MEAN" />
          </div>
          {solar.loading ? (
            <Skeleton className="h-44 w-full rounded-xl" />
          ) : solar.error || !solar.data ? (
            <EmptyState icon={<AlertTriangle className="h-8 w-8" />} title="NASA POWER unavailable" hint={solar.error ?? undefined} />
          ) : (
            <BarChart
              data={(solar.data.monthlyGhi as { month: string; value: number }[]).filter(Boolean).map((g) => ({ label: g.month.slice(0, 3), value: g.value, color: "#fbbf24" }))}
              valueFormat={(v) => `${v.toFixed(1)}`}
            />
          )}
          {solar.data && (
            <p className="text-xs text-muted-foreground">
              Annual mean: <span className="font-mono text-foreground">{solar.data.annualMeanGhi === null ? "—" : fmtNum(solar.data.annualMeanGhi, 2)}</span> kWh/m²/day.{" "}
              <button className="text-primary hover:underline" onClick={() => navigate("energy")}>Use this in the solar calculator →</button>
            </p>
          )}
          <SourcePanel provenance={solar.data?.provenance} />
        </GlassCard>
      </div>

      {/* --------------------------- BIO + ANALYTICS --------------------------- */}
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold"><Bird className="h-4 w-4 text-primary" /> Biodiversity snapshot · 25 km around {primary.name}</h3>
            <DataBadge kind="live" label="GBIF" />
          </div>
          {bio.loading ? (
            <Skeleton className="h-44 w-full rounded-xl" />
          ) : bio.error || !bio.data ? (
            <EmptyState icon={<AlertTriangle className="h-8 w-8" />} title="GBIF unreachable" hint={bio.error ?? undefined} />
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-semibold text-gradient-eco">{fmtNum(bio.data.totalCount, 1)}</span>
                <span className="text-xs text-muted-foreground">occurrence records in GBIF for this area</span>
              </div>
              <div className="scroll-slim max-h-40 space-y-1.5 overflow-y-auto pr-1">
                {bio.data.speciesCounts.map((s) => (
                  <div key={s.species} className="flex items-center justify-between text-xs">
                    <span className="truncate italic text-foreground/85">{s.species}</span>
                    <span className="shrink-0 text-muted-foreground">{s.count} in sample · {s.kingdom}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {bio.data.analytics.limitations[0]} Sample of {bio.data.sampledRecords} records.
              </p>
              <SourcePanel provenance={bio.data.provenance} extra={[{ label: "Confidence", value: bio.data.analytics.confidence }]} />
            </>
          )}
        </GlassCard>

        <GlassCard className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold"><TrendingUp className="h-4 w-4 text-accent" /> Derived analytics · decadal comparison</h3>
            <DataBadge kind="estimate" label="DERIVED" />
          </div>
          {climate.data?.delta ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/60 bg-background/40 p-3">
                  <div className="text-xs text-muted-foreground">Mean temperature shift</div>
                  <div className="mt-1 font-mono text-2xl font-semibold">
                    {climate.data.delta.meanTemperatureShift === null ? "—" : `${climate.data.delta.meanTemperatureShift > 0 ? "+" : ""}${fmtNum(climate.data.delta.meanTemperatureShift, 2)} °C`}
                  </div>
                  <div className="mt-1 text-[10px] text-muted-foreground">{climate.data.periods.a.label} → {climate.data.periods.b.label}</div>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/40 p-3">
                  <div className="text-xs text-muted-foreground">Annual precipitation shift</div>
                  <div className="mt-1 font-mono text-2xl font-semibold">
                    {climate.data.delta.precipitationShiftPercent === null ? "—" : `${climate.data.delta.precipitationShiftPercent > 0 ? "+" : ""}${fmtNum(climate.data.delta.precipitationShiftPercent, 1)} %`}
                  </div>
                  <div className="mt-1 text-[10px] text-muted-foreground">reanalysis-based estimate</div>
                </div>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/40 p-3 text-xs leading-relaxed text-muted-foreground">
                <p><span className="font-medium text-foreground/80">Methodology:</span> {climate.data.analytics.methodology}</p>
                <p className="mt-2"><span className="font-medium text-foreground/80">Data kind:</span> {climate.data.analytics.dataKind}</p>
                <p className="mt-2"><span className="font-medium text-foreground/80">Confidence:</span> {climate.data.analytics.confidence}</p>
                <p className="mt-2"><span className="font-medium text-foreground/80">Limitations:</span> {climate.data.analytics.limitations.join(" ")}</p>
              </div>
              <SourcePanel provenance={climate.data?.provenance} />
            </div>
          ) : (
            <EmptyState title="Analytics unavailable" hint={climate.error ?? "Climate archive could not be retrieved for this location."} />
          )}
        </GlassCard>
      </div>

      {/* --------------------------- INTEGRATION STATUS --------------------------- */}
      <GlassCard className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold"><Scale className="h-4 w-4 text-primary" /> Environmental data integration status</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Live probes of every configured source · checked {status.data ? timeago(status.data.checkedAt) : "..."}
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" /> {status.data?.summary.operational ?? "—"} operational
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-chart-4/30 bg-chart-4/10 px-2 py-1 text-chart-4">
              <KeyRound className="h-3.5 w-3.5" /> {status.data?.summary.requiresKey ?? "—"} key-gated
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-1 text-destructive">
              <XCircle className="h-3.5 w-3.5" /> {status.data?.summary.unavailable ?? "—"} not integrated
            </span>
          </div>
        </div>
        {status.loading ? (
          <Skeleton className="h-56 w-full rounded-xl" />
        ) : status.error ? (
          <p className="text-sm text-destructive">Status check failed: {status.error}</p>
        ) : (
          <div className="scroll-slim max-h-96 overflow-y-auto rounded-xl border border-border/60">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-44">Source</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead>What it provides</TableHead>
                  <TableHead className="w-48">Update cadence</TableHead>
                  <TableHead className="w-40">Auth</TableHead>
                  <TableHead className="w-52">Licence / terms</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {status.data!.sources.map((s) => (
                  <TableRow key={s.id} className="align-top">
                    <TableCell className="break-words font-medium">{s.name}</TableCell>
                    <TableCell>
                      {s.status === "operational" ? (
                        <DataBadge kind="live" label="OPERATIONAL" />
                      ) : s.status === "requires-key" ? (
                        <DataBadge kind="estimate" label="API KEY NEEDED" />
                      ) : (
                        <DataBadge kind="stale" label="NOT INTEGRATED" />
                      )}
                    </TableCell>
                    <TableCell className="break-words text-xs text-muted-foreground">{s.what}</TableCell>
                    <TableCell className="break-words text-xs text-muted-foreground">{s.updateFrequency}</TableCell>
                    <TableCell className="break-words text-xs text-muted-foreground">{s.auth}</TableCell>
                    <TableCell className="break-words text-xs text-muted-foreground">{s.licence}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <IntegrityNote />
      </GlassCard>
    </div>
  );
}

function timeago(iso: string): string {
  return fmtDate(iso);
}
