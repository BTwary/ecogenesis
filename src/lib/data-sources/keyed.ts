import "server-only";
import { fetchJson } from "./http";

/**
 * Connectors that require an API key. They are fully implemented but remain
 * DISABLED until the key is provided via environment variables. The platform
 * degrades gracefully and reports them in the integration status panel.
 */

// ---------------------------------------------------------------------------
// OpenAQ v3 — global air-quality observations from ground stations.
// Requires X-API-Key (free tier available at https://explore.openaq.org).
// Licence: CC BY 4.0 (per-provider licences apply, attribution required).
// ---------------------------------------------------------------------------
export interface OpenAqLocation {
  id: number;
  name: string;
  locality?: string;
  coordinates?: { latitude?: number; longitude?: number };
  sensors?: {
    id: number;
    parameter: { name: string; units?: string };
  }[];
}

export interface OpenAqReading {
  locationId: number;
  stationName: string;
  locality: string | null;
  latitude: number;
  longitude: number;
  parameter: string;
  value: number;
  unit: string;
  observedAtUtc: string;
}

export function openAqApiKey(): string | null {
  return process.env.OPENAQ_API_KEY || null;
}

const OPENAQ_PARAMETER_MAP: Record<string, string> = {
  pm25: "pm2_5",
  pm2_5: "pm2_5",
  pm10: "pm10",
  no2: "nitrogen_dioxide",
  so2: "sulphur_dioxide",
  o3: "ozone",
  co: "carbon_monoxide",
};

interface OpenAqLatestResponse {
  results?: {
    value: number;
    datetime?: { utc?: string };
    sensorsId?: number;
    locationsId?: number;
  }[];
}

/** Fetch latest readings from nearby OpenAQ ground-station sensors. */
export async function fetchOpenAq(lat: number, lng: number, radiusM = 25000): Promise<OpenAqReading[]> {
  const key = openAqApiKey();
  if (!key) throw new Error("OPENAQ_API_KEY not configured — connector requires a key");
  const baseUrl = "https://api.openaq.org/v3/locations";
  const params = new URLSearchParams({ coordinates: `${lat},${lng}`, radius: String(radiusM), limit: "10", page: "1" });
  const locationsResponse = await fetchJson<{ results?: OpenAqLocation[] }>(`${baseUrl}?${params}`, {
    timeoutMs: 15000,
    retries: 1,
    headers: { "X-API-Key": key },
  });
  const locations = (locationsResponse.results ?? []).filter((location) =>
    Number.isFinite(location.id) && Number.isFinite(location.coordinates?.latitude) && Number.isFinite(location.coordinates?.longitude),
  );

  const stationReadings = await Promise.all(locations.map(async (location) => {
    const latestUrl = `https://api.openaq.org/v3/locations/${location.id}/latest?limit=100&page=1`;
    const latest = await fetchJson<OpenAqLatestResponse>(latestUrl, {
      timeoutMs: 15000,
      retries: 1,
      headers: { "X-API-Key": key },
    });
    const sensorById = new Map((location.sensors ?? []).map((sensor) => [sensor.id, sensor]));
    return (latest.results ?? []).flatMap((reading) => {
      const sensor = reading.sensorsId ? sensorById.get(reading.sensorsId) : undefined;
      const nativeName = sensor?.parameter?.name?.toLowerCase().replace(/[ .-]/g, "") ?? "";
      const parameter = OPENAQ_PARAMETER_MAP[nativeName];
      const timestamp = reading.datetime?.utc;
      if (!parameter || !Number.isFinite(reading.value) || !timestamp || !Number.isFinite(Date.parse(timestamp))) return [];
      return [{
        locationId: location.id,
        stationName: location.name,
        locality: location.locality ?? null,
        latitude: location.coordinates!.latitude!,
        longitude: location.coordinates!.longitude!,
        parameter,
        value: reading.value,
        unit: sensor?.parameter?.units ?? "unknown",
        observedAtUtc: timestamp,
      }];
    });
  }));
  return stationReadings.flat();
}

// ---------------------------------------------------------------------------
// data.gov.in — CPCB real-time Air Quality Index for Indian stations.
// Requires a data.gov.in API key (free registration).
// ---------------------------------------------------------------------------
export interface DataGovReading {
  station: string;
  city: string;
  state: string;
  pollutant: string;
  avg: number | null;
  min: number | null;
  max: number | null;
  unit: string;
  updatedAt: string;
  latitude: number | null;
  longitude: number | null;
}

export function dataGovApiKey(): string | null {
  return process.env.DATA_GOV_IN_KEY || null;
}

export async function fetchDataGovAir(city?: string, limit = 100): Promise<DataGovReading[]> {
  const key = dataGovApiKey();
  if (!key) throw new Error("DATA_GOV_IN_KEY not configured — connector disabled");
  // CPCB "Real-time Air Quality Index from monitoring stations" resource
  const resourceId = "3b01bcb8-0b14-4abf-b6f2-c74bfdca3340";
  const baseUrl = `https://api.data.gov.in/resource/${resourceId}`;
  const params = new URLSearchParams({
    "api-key": key,
    format: "json",
    limit: String(limit),
  });
  if (city) params.set("filters[city]", city);
  const json = await fetchJson<{
    records?: Record<string, string | number>[];
  }>(`${baseUrl}?${params.toString()}`, { timeoutMs: 15000, retries: 1 });

  const records = json.records ?? [];
  return records.map((r) => ({
    station: String(r.station ?? ""),
    city: String(r.city ?? ""),
    state: String(r.state ?? ""),
    pollutant: String(r.pollutant_id ?? ""),
    avg: r.pollutant_avg != null ? Number(r.pollutant_avg) : null,
    min: r.pollutant_min != null ? Number(r.pollutant_min) : null,
    max: r.pollutant_max != null ? Number(r.pollutant_max) : null,
    unit: String(r.unit ?? "NA"),
    updatedAt: String(r.last_update ?? ""),
    latitude: r.latitude != null && Number.isFinite(Number(r.latitude)) ? Number(r.latitude) : null,
    longitude: r.longitude != null && Number.isFinite(Number(r.longitude)) ? Number(r.longitude) : null,
  }));
}
