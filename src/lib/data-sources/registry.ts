import "server-only";
import { fetchJson } from "./http";
import { fetchAirQuality, fetchNasaClimatology, fetchGbif } from "./connectors";
import { openAqApiKey, fetchDataGovAir, dataGovApiKey } from "./keyed";

/**
 * Source-by-source integration status. Each free source is probed live
 * (cached in-memory for 5 minutes) so the UI never pretends a connector
 * works when it does not.
 */

export type SourceStatus = "operational" | "requires-key" | "unavailable";

export interface SourceReport {
  id: string;
  name: string;
  what: string;
  status: SourceStatus;
  auth: string;
  updateFrequency: string;
  coverage: string;
  licence: string;
  endpoints: string[];
  notes: string;
  latencyMs?: number;
  lastChecked: string;
}

interface MemoryCacheEntry {
  at: number;
  value: Omit<SourceReport, "lastChecked">[];
}
let cache: MemoryCacheEntry | null = null;
const TTL = 5 * 60 * 1000;

async function probe(url: string, headers?: Record<string, string>): Promise<{ ok: boolean; ms: number; detail: string }> {
  const t0 = Date.now();
  try {
    await fetchJson<unknown>(url, { timeoutMs: 8000, retries: 1, headers });
    return { ok: true, ms: Date.now() - t0, detail: "live probe succeeded" };
  } catch (e) {
    return { ok: false, ms: Date.now() - t0, detail: e instanceof Error ? e.message.slice(0, 140) : "probe failed" };
  }
}

export async function getIntegrationStatus(): Promise<SourceReport[]> {
  if (cache && Date.now() - cache.at < TTL) {
    return cache.value.map((v) => ({ ...v, lastChecked: new Date(cache!.at).toISOString() }));
  }

  const [air, archive, nasa, gbif] = await Promise.all([
    probe("https://air-quality-api.open-meteo.com/v1/air-quality?latitude=28.61&longitude=77.20&hourly=pm2_5&past_days=0&forecast_days=1&timezone=UTC"),
    probe("https://archive-api.open-meteo.com/v1/archive?latitude=28.61&longitude=77.20&start_date=2024-01-01&end_date=2024-01-03&daily=temperature_2m_max&timezone=UTC"),
    probe("https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&latitude=28.61&longitude=77.20&format=JSON"),
    probe("https://api.gbif.org/v1/occurrence/search?geometry=" + encodeURIComponent("POLYGON((77.2 28.6, 77.3 28.6, 77.3 28.7, 77.2 28.7, 77.2 28.6))") + "&limit=1"),
  ]);

  const openAqKey = openAqApiKey();
  let openAq: { ok: boolean; ms: number; detail: string } = { ok: false, ms: 0, detail: "" };
  let openAqStatus: "requires-key" | "operational" | "unavailable" = "requires-key";
  if (openAqKey) {
    openAq = await probe("https://api.openaq.org/v3/locations?limit=1", { "X-API-Key": openAqKey });
    openAqStatus = openAq.ok ? "operational" : "unavailable";
  }

  const dgKey = dataGovApiKey();
  let dg: { ok: boolean; ms: number; detail: string } = { ok: false, ms: 0, detail: "" };
  let dgStatus: "requires-key" | "operational" | "unavailable" = "requires-key";
  if (dgKey) {
    try {
      const recs = await fetchDataGovAir(undefined, 5);
      dg = { ok: recs.length > 0, ms: 0, detail: `returned ${recs.length} station records` };
      dgStatus = dg.ok ? "operational" : "unavailable";
    } catch (e) {
      dg = { ok: false, ms: 0, detail: e instanceof Error ? e.message.slice(0, 140) : "probe failed" };
      dgStatus = "unavailable";
    }
  }

  const out: Omit<SourceReport, "lastChecked">[] = [
    {
      id: "open-meteo-air",
      name: "Open-Meteo Air Quality (CAMS)",
      what: "Hourly PM2.5, PM10, NO2, SO2, O3, CO and US-AQI model estimates",
      status: air.ok ? "operational" : "unavailable",
      auth: "None required",
      updateFrequency: "Hourly (model-driven; CAMS assimilation cycle)",
      coverage: "Global (CAMS global + European ensemble), gridded model output",
      licence: "CC BY 4.0 via Open-Meteo — free for non-commercial use, attribution required",
      endpoints: ["https://air-quality-api.open-meteo.com/v1/air-quality"],
      notes: air.ok ? "Integrated: used by Air Quality indicator, dashboard and map point-lookup." : `Probe failed: ${air.detail}`,
      latencyMs: air.ms,
    },
    {
      id: "open-meteo-archive",
      name: "Open-Meteo Historical Weather (ERA5)",
      what: "Daily temperature max/min and precipitation, 1940-present",
      status: archive.ok ? "operational" : "unavailable",
      auth: "None required",
      updateFrequency: "ERA5 reanalysis: ~5-day lag; daily granularity",
      coverage: "Global, ~25 km grid reanalysis (Copernicus/ECMWF ERA5)",
      licence: "Free for non-commercial use with attribution (Open-Meteo terms)",
      endpoints: ["https://archive-api.open-meteo.com/v1/archive"],
      notes: archive.ok
        ? "Integrated: drives Climate Trends (decadal climatology comparison) and Rainwater-Harvesting monthly totals."
        : `Probe failed: ${archive.detail}`,
      latencyMs: archive.ms,
    },
    {
      id: "nasa-power",
      name: "NASA POWER",
      what: "Satellite-derived long-term climatology: solar irradiance (GHI) and 2m temperature",
      status: nasa.ok ? "operational" : "unavailable",
      auth: "None required",
      updateFrequency: "Climatology product: periodic reissue (currently 2001-2023 means)",
      coverage: "Global, ~0.5 deg grid, satellite + model assimilation",
      licence: "Free and open — attribution: NASA Langley Research Center POWER Project",
      endpoints: ["https://power.larc.nasa.gov/api/temporal/climatology/point"],
      notes: nasa.ok
        ? "Integrated: Solar Resource indicator + Renewable Energy solar calculator inputs."
        : `Probe failed: ${nasa.detail}`,
      latencyMs: nasa.ms,
    },
    {
      id: "gbif",
      name: "GBIF (Global Biodiversity Information Facility)",
      what: "Species occurrence records near any coordinate",
      status: gbif.ok ? "operational" : "unavailable",
      auth: "None required",
      updateFrequency: "Continuously updated by data publishers; irregular per region",
      coverage: "Global, presence records from thousands of datasets",
      licence: "CC0 / CC BY per underlying dataset — GBIF mediated, attribution required",
      endpoints: ["https://api.gbif.org/v1/occurrence/search"],
      notes: gbif.ok
        ? "Integrated: Biodiversity Explorer + map biodiversity scan (occurrence snapshots within 10 km)."
        : `Probe failed: ${gbif.detail}`,
      latencyMs: gbif.ms,
    },
    {
      id: "openaq",
      name: "OpenAQ",
      what: "Ground-station air-quality observations aggregated worldwide",
      status: openAqStatus,
      auth: "API key required (free registration at explore.openaq.org). Set OPENAQ_API_KEY env var.",
      updateFrequency: "Continuous per station (typically 15-60 min)",
      coverage: "Global station network (varies by country)",
      licence: "Underlying provider licences vary; inspect source dataset licence and attribution metadata.",
      endpoints: ["https://api.openaq.org/v3/locations"],
      notes: openAqKey
        ? openAq.ok
          ? "API key probe succeeded. The nearby-station query runs on dashboard requests; returned station readings are shown separately from CAMS and are not merged."
          : `Key configured but probe failed: ${openAq.detail}`
        : "Connector fully implemented but DISABLED — no OPENAQ_API_KEY configured. Open-Meteo CAMS model data is used instead and is clearly labelled as model output.",
      latencyMs: openAq.ms || undefined,
    },
    {
      id: "datagovin",
      name: "data.gov.in — CPCB real-time station pollutants (India)",
      what: "CPCB station-level pollutant readings for Indian cities",
      status: dgStatus,
      auth: "data.gov.in API key required (free registration). Set DATA_GOV_IN_KEY env var.",
      updateFrequency: "Per station cycle (~15-60 min during monitoring hours)",
      coverage: "India — continuous monitoring stations",
      licence: "Government Open Data — usage per data.gov.in access policy, attribution required",
      endpoints: ["https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c74bfdca3340"],
      notes: dgKey
        ? dg.ok
          ? "Key configured; connector ready."
          : `Key configured but probe failed: ${dg.detail}`
        : "Connector fully implemented but DISABLED — no DATA_GOV_IN_KEY configured. Set the env var to activate Indian station data.",
    },
    {
      id: "copernicus",
      name: "Copernicus (CDSE satellite imagery)",
      what: "Sentinel satellite imagery and land monitoring",
      status: "unavailable",
      auth: "Interactive CDSE registration + OAuth token flow required",
      updateFrequency: "Orbit-based (minutes to days)",
      coverage: "Global",
      licence: "Free, open licence with attribution — but requires registered account",
      endpoints: ["https://dataspace.copernicus.eu/"],
      notes:
        "NOT integrated: registration involves an interactive account and OAuth token issuance that cannot be completed in this environment. Open-Meteo (ERA5/CAMS, both Copernicus services) covers the platform's current needs and is attributed accordingly.",
    },
    {
      id: "gfw",
      name: "Global Forest Watch",
      what: "Forest change alerts and tree-cover loss data",
      status: "unavailable",
      auth: "API token required (GFW account) and non-commercial terms apply",
      updateFrequency: "Daily to monthly, per product",
      coverage: "Global",
      licence: "CC BY 4.0 with GFW-specific usage terms; token-gated API",
      endpoints: ["https://www.globalforestwatch.org/"],
      notes:
        "NOT integrated: requires a GFW account token which cannot be issued in this environment. No forest-change indicator is shown rather than a substitute being faked.",
    },
  ];

  cache = { at: Date.now(), value: out };
  return out.map((v) => ({ ...v, lastChecked: new Date(cache!.at).toISOString() }));
}

// Re-export connectors for convenience in API routes
export { fetchAirQuality, fetchNasaClimatology, fetchGbif };
