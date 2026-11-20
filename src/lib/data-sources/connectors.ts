import "server-only";
import { fetchJson } from "./http";
import type { ConnectorFetch, RawObservation } from "./types";
export { aggregateMonthly } from "./climate";

/**
 * Real environmental data connectors. Each returns a ConnectorFetch with
 * full attribution. Unit normalisation happens here.
 */

export interface OpenMeteoHourly {
  hourly: {
    time: string[];
    [param: string]: (number | null)[] | string[];
  };
}

export interface OpenMeteoDaily {
  daily: {
    time: string[];
    [param: string]: (number | null)[] | string[];
  };
}

// ---------------------------------------------------------------------------
// Open-Meteo Air Quality (CAMS global/European) — no API key required
// Licence: CC BY 4.0 (attribution required); free tier, non-commercial terms.
// ---------------------------------------------------------------------------
const AIR_PARAMS = [
  "pm10",
  "pm2_5",
  "carbon_monoxide",
  "nitrogen_dioxide",
  "sulphur_dioxide",
  "ozone",
  "us_aqi",
] as const;

export async function fetchAirQuality(lat: number, lng: number): Promise<ConnectorFetch> {
  const baseUrl = "https://air-quality-api.open-meteo.com/v1/air-quality";
  const url = `${baseUrl}?latitude=${lat}&longitude=${lng}&hourly=${AIR_PARAMS.join(
    ",",
  )}&past_days=2&forecast_days=1&timezone=UTC`;
  const json = await fetchJson<OpenMeteoHourly>(url, { timeoutMs: 15000 });

  const times = json.hourly.time;
  const cutoff = Date.now() - 24 * 3600 * 1000;
  const observations: RawObservation[] = [];

  for (let i = 0; i < times.length; i++) {
    const t = new Date(`${times[i]}Z`);
    if (Number.isNaN(t.getTime()) || t.getTime() < cutoff || t.getTime() > Date.now() + 3600e3) continue;
    for (const p of AIR_PARAMS) {
      const series = json.hourly[p] as (number | null)[] | undefined;
      const v = series?.[i];
      if (typeof v === "number") {
        observations.push({ parameter: p, observedAt: t, value: v, unit: p.includes("aqi") ? "index" : "ug/m3" });
      }
    }
  }

  return {
    provider: "open-meteo",
    datasetId: "cams_air_quality_hourly",
    lat,
    lng,
    observations,
    sourceUrl: baseUrl,
    licence: "CAMS data redistributed by Open-Meteo — CC BY 4.0, free for non-commercial use with attribution",
    notes: "Model output from Copernicus Atmosphere Monitoring Service via Open-Meteo. Model estimates, not in-situ station measurements.",
  };
}

// ---------------------------------------------------------------------------
// Open-Meteo Historical Weather (ERA5 reanalysis) — no API key required
// Licence: free for non-commercial use with attribution (Open-Meteo terms).
// ---------------------------------------------------------------------------
const ARCHIVE_PARAMS = "temperature_2m_max,temperature_2m_min,precipitation_sum";

export async function fetchArchiveDaily(
  lat: number,
  lng: number,
  start: string, // YYYY-MM-DD
  end: string,
): Promise<ConnectorFetch> {
  const baseUrl = "https://archive-api.open-meteo.com/v1/archive";
  const url = `${baseUrl}?latitude=${lat}&longitude=${lng}&start_date=${start}&end_date=${end}&daily=${ARCHIVE_PARAMS}&timezone=UTC`;
  const json = await fetchJson<OpenMeteoDaily>(url, { timeoutMs: 25000, retries: 1 });

  const times = json.daily.time;
  const observations: RawObservation[] = [];
  const series: Record<string, (number | null)[]> = {
    temperature_2m_max: json.daily.temperature_2m_max as (number | null)[],
    temperature_2m_min: json.daily.temperature_2m_min as (number | null)[],
    precipitation_sum: json.daily.precipitation_sum as (number | null)[],
  };

  for (let i = 0; i < times.length; i++) {
    const t = new Date(`${times[i]}T00:00:00Z`);
    if (Number.isNaN(t.getTime())) continue;
    for (const [param, arr] of Object.entries(series)) {
      const v = arr?.[i];
      if (typeof v === "number") {
        observations.push({
          parameter: param,
          observedAt: t,
          value: v,
          unit: param === "precipitation_sum" ? "mm" : "degC",
        });
      }
    }
  }

  return {
    provider: "open-meteo",
    datasetId: "era5_archive_daily",
    lat,
    lng,
    observations,
    sourceUrl: baseUrl,
    licence: "ERA5 reanalysis redistributed by Open-Meteo — free for non-commercial use with attribution",
    notes: "ERA5 model reanalysis (Copernicus/ECMWF). Historical model estimates, not station observations.",
  };
}

// ---------------------------------------------------------------------------
// NASA POWER climatology point (satellite-derived, 22-year monthly means)
// Free, no key. https://power.larc.nasa.gov
// ---------------------------------------------------------------------------
export interface NasaPowerClimatology {
  properties: {
    parameter: Record<string, Record<string, number>>;
  };
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export async function fetchNasaClimatology(lat: number, lng: number): Promise<ConnectorFetch> {
  const baseUrl = "https://power.larc.nasa.gov/api/temporal/climatology/point";
  const url = `${baseUrl}?parameters=ALLSKY_SFC_SW_DWN,T2M&community=RE&latitude=${lat}&longitude=${lng}&start=2001&end=2023&format=JSON`;
  const json = await fetchJson<NasaPowerClimatology>(url, { timeoutMs: 20000, retries: 1 });

  const ghi = json.properties?.parameter?.ALLSKY_SFC_SW_DWN;
  const t2m = json.properties?.parameter?.T2M;
  const observations: RawObservation[] = [];

  MONTHS.forEach((m, i) => {
    const t = new Date(Date.UTC(2001, i, 15)); // climatological month placeholder
    const g = ghi?.[m];
    const tt = t2m?.[m];
    if (typeof g === "number" && g >= -99) {
      observations.push({
        parameter: "solar_ghi",
        observedAt: t,
        value: g,
        unit: "kWh/m2/day",
        meta: { nasaMonth: m, nasaClimatologyPeriod: "2001-2023" },
      });
    }
    if (typeof tt === "number" && tt >= -99) {
      observations.push({
        parameter: "temperature_monthly",
        observedAt: t,
        value: tt,
        unit: "degC",
        meta: { nasaMonth: m, nasaClimatologyPeriod: "2001-2023" },
      });
    }
  });

  return {
    provider: "nasa-power",
    datasetId: "power_climatology_point",
    lat,
    lng,
    observations,
    sourceUrl: baseUrl,
    licence: "NASA POWER data — free and open use, attribution: NASA Langley Research Center (LaRC) POWER Project",
    notes: "Satellite-derived 22-year (2001-2023) monthly climatology. ALLSKY_SFC_SW_DWN = global horizontal irradiance (kWh/m2/day, community=RE).",
  };
}

// ---------------------------------------------------------------------------
// GBIF occurrence search — free, no key. https://api.gbif.org
// ---------------------------------------------------------------------------
export interface GbifSearch {
  count: number;
  results: {
    species?: string;
    scientificName?: string;
    acceptedScientificName?: string;
    kingdom?: string;
    eventDate?: string;
    decimalLatitude?: number;
    decimalLongitude?: number;
    basisOfRecord?: string;
  }[];
}

export interface GbifSnapshot {
  totalCount: number;
  sampled: number;
  speciesCounts: { species: string; count: number; kingdom: string }[];
  recent: {
    species: string;
    observedAt: string | null;
    lat: number;
    lng: number;
    basisOfRecord: string;
  }[];
}

export async function fetchGbif(lat: number, lng: number, distanceKm = 10): Promise<GbifSnapshot> {
  const baseUrl = "https://api.gbif.org/v1/occurrence/search";
  // GBIF's lat/lng+distance params are unreliable in v1; a circular WKT
  // polygon is the supported geospatial filter. 16-vertex circle approximation.
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (2 * Math.PI * i) / 16;
    const dLat = (distanceKm / 111.32) * Math.cos(a);
    const dLng = (distanceKm / (111.32 * Math.cos((lat * Math.PI) / 180) || 1)) * Math.sin(a);
    pts.push(`${(lng + dLng).toFixed(5)} ${(lat + dLat).toFixed(5)}`);
  }
  pts.push(pts[0]);
  const geometry = `POLYGON((${pts.join(", ")}))`;
  const url = `${baseUrl}?geometry=${encodeURIComponent(geometry)}&hasCoordinate=true&limit=300`;
  const json = await fetchJson<GbifSearch>(url, { timeoutMs: 15000 });

  const counts = new Map<string, { count: number; kingdom: string }>();
  const recent: GbifSnapshot["recent"] = [];
  for (const r of json.results) {
    const name = r.species || r.acceptedScientificName || r.scientificName;
    if (!name) continue;
    const cur = counts.get(name) ?? { count: 0, kingdom: r.kingdom ?? "Unknown" };
    cur.count += 1;
    counts.set(name, cur);
    recent.push({
      species: name,
      observedAt: r.eventDate ?? null,
      lat: r.decimalLatitude ?? lat,
      lng: r.decimalLongitude ?? lng,
      basisOfRecord: r.basisOfRecord ?? "UNKNOWN",
    });
  }

  const speciesCounts = [...counts.entries()]
    .map(([species, v]) => ({ species, count: v.count, kingdom: v.kingdom }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  return {
    totalCount: json.count ?? 0,
    sampled: json.results.length,
    speciesCounts,
    recent: recent.slice(0, 40),
  };
}
