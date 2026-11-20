/**
 * Standardised types for the Environmental Data Integration Layer.
 * Every observation that enters the platform must carry full provenance.
 */

export interface RawObservation {
  parameter: string; // normalised parameter key, e.g. "pm2_5"
  observedAt: Date; // ORIGINAL observation timestamp from the provider
  value: number; // normalised value
  unit: string; // normalised unit, e.g. "ug/m3", "mm", "kWh/m2/day", "degC"
  originalUnit?: string; // provider-native unit if different
  meta?: Record<string, unknown>; // extra native fields for traceability
}

export interface ConnectorFetch {
  provider: string;
  datasetId: string;
  lat: number;
  lng: number;
  observations: RawObservation[];
  sourceUrl: string;
  licence: string;
  notes?: string;
}

export interface Provenance {
  provider: string;
  providerName: string;
  datasetId: string;
  sourceUrl: string;
  licence: string;
  retrievedAt: string; // ISO — when ECOGENESIS fetched it
  cached: boolean;
  stale?: boolean;
  notes?: string;
}

export type QualityStatus = "good" | "stale" | "invalid" | "estimated";

export const PROVIDER_NAMES: Record<string, string> = {
  "open-meteo": "Open-Meteo",
  "nasa-power": "NASA POWER (LARC)",
  gbif: "GBIF",
  openaq: "OpenAQ",
  datagovin: "data.gov.in (CPCB/NAQI)",
};

export function iso(d: Date | string): string {
  return typeof d === "string" ? d : d.toISOString();
}
