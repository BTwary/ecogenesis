import "server-only";
import { db } from "@/lib/db";
import type { ConnectorFetch } from "./types";
import { validateValue } from "./quality";

/**
 * SQLite-backed observation cache with full provenance.
 * - Observations that fail quality validation are DROPPED (never fabricated).
 * - Every stored row keeps provider, dataset, unit, timestamps and licence.
 */

export function locKey(lat: number, lng: number): string {
  return `${lat.toFixed(2)},${lng.toFixed(2)}`;
}

export async function logConnector(
  provider: string,
  endpoint: string,
  status: "ok" | "error" | "disabled",
  message?: string,
  latencyMs?: number,
) {
  try {
    await db.connectorLog.create({
      data: { provider, endpoint, status, message: message?.slice(0, 300), latencyMs },
    });
  } catch {
    // logging must never break the data path
  }
}

export interface StoredRow {
  provider: string;
  datasetId: string;
  parameter: string;
  observedAt: Date;
  value: number;
  unit: string;
  meta: string | null;
  quality: string;
  retrievedAt: Date;
}

/** Persist a connector fetch, dropping invalid values and existing duplicates.
 *  (SQLite connector: createMany has no skipDuplicates, so we pre-filter.) */
export async function storeFetch(f: ConnectorFetch): Promise<{ stored: number; dropped: number }> {
  const key = locKey(f.lat, f.lng);
  const now = new Date();
  const rows = f.observations.filter((o) => validateValue(o.parameter, o.value) === "good");
  const dropped = f.observations.length - rows.length;
  if (rows.length === 0) return { stored: 0, dropped };

  const params = [...new Set(rows.map((o) => o.parameter))];
  const observed = rows.map((o) => o.observedAt.getTime());
  const existing = await db.dataObservation.findMany({
    where: {
      provider: f.provider,
      datasetId: f.datasetId,
      locationKey: key,
      parameter: { in: params },
      observedAt: { gte: new Date(Math.min(...observed)), lte: new Date(Math.max(...observed)) },
    },
    select: { parameter: true, observedAt: true },
  });
  const seen = new Set(existing.map((e) => `${e.parameter}|${new Date(e.observedAt).getTime()}`));
  const freshRows = rows.filter((o) => !seen.has(`${o.parameter}|${o.observedAt.getTime()}`));

  if (freshRows.length > 0) {
    const data = freshRows.map((o) => ({
      provider: f.provider,
      datasetId: f.datasetId,
      parameter: o.parameter,
      locationKey: key,
      lat: f.lat,
      lng: f.lng,
      observedAt: o.observedAt,
      value: o.value,
      unit: o.unit,
      originalUnit: o.originalUnit ?? o.unit,
      meta: JSON.stringify({ sourceUrl: f.sourceUrl, licence: f.licence, ...(o.meta ?? {}) }),
      quality: "good" as const,
      retrievedAt: now,
    }));
    try {
      await db.dataObservation.createMany({ data });
    } catch {
      // race with a concurrent fetch — insert one-by-one, ignoring conflicts
      for (const row of data) {
        try {
          await db.dataObservation.create({ data: row });
        } catch {
          // duplicate — safe to ignore
        }
      }
    }
  }
  return { stored: freshRows.length, dropped };
}

export interface CacheRead {
  rows: StoredRow[];
  retrievedAt: Date | null;
  fresh: boolean; // true if newest retrieval is within TTL
}

export async function readCached(
  q: {
    provider: string;
    datasetId: string;
    parameters?: string[];
    locationKey: string;
    from?: Date;
    to?: Date;
  },
  ttlSec: number,
  take = 4000,
): Promise<CacheRead | null> {
  const rows = await db.dataObservation.findMany({
    where: {
      provider: q.provider,
      datasetId: q.datasetId,
      locationKey: q.locationKey,
      ...(q.parameters ? { parameter: { in: q.parameters } } : {}),
      ...(q.from || q.to
        ? { observedAt: { ...(q.from ? { gte: q.from } : {}), ...(q.to ? { lte: q.to } : {}) } }
        : {}),
    },
    orderBy: { observedAt: "asc" },
    take,
  });
  if (rows.length === 0) return null;
  const newest = rows.reduce((m, r) => Math.max(m, r.retrievedAt.getTime()), 0);
  return { rows, retrievedAt: new Date(newest), fresh: Date.now() - newest < ttlSec * 1000 };
}
