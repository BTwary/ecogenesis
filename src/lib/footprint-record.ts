import { calculateFootprint, type Factor } from "./factors.ts";

export const FOOTPRINT_ALLOCATION_VERSION = 2;

export interface StoredFootprintLike {
  id: string;
  inputs: string;
  factorsJson: string;
  totalKgCo2e: number;
  categories: string;
  createdAt: Date;
}

export interface ResolvedFootprint {
  id: string;
  totalKgCo2e: number;
  categories: { key: string; label: string; kgCo2e: number }[];
  createdAt: Date;
  recalculatedForAllocation: boolean;
  factorSnapshotAvailable: boolean;
}

export function makeFactorSnapshot(factors: Factor[]): string {
  return JSON.stringify({ allocationVersion: FOOTPRINT_ALLOCATION_VERSION, factors });
}

/**
 * Older releases divided every category by household size, including personal
 * transport, diet and goods. Recompute those records from their saved inputs so
 * existing history is not silently shown with the corrected per-person label.
 * Current-version records are returned as stored and remain reproducible from
 * their factor snapshot.
 */
export function resolveFootprintRecord(record: StoredFootprintLike): ResolvedFootprint {
  let snapshot: unknown;
  try {
    snapshot = JSON.parse(record.factorsJson);
  } catch {
    snapshot = null;
  }
  const snapshotVersion = snapshot && typeof snapshot === "object" && !Array.isArray(snapshot)
    ? (snapshot as { allocationVersion?: unknown }).allocationVersion
    : null;

  const snapshotHasFactors = snapshot && typeof snapshot === "object" && !Array.isArray(snapshot) &&
    Array.isArray((snapshot as { factors?: unknown }).factors);
  if (snapshotVersion === FOOTPRINT_ALLOCATION_VERSION && snapshotHasFactors) {
    let categories: ResolvedFootprint["categories"];
    try {
      categories = JSON.parse(record.categories) as ResolvedFootprint["categories"];
    } catch {
      categories = [];
    }
    return {
      id: record.id,
      totalKgCo2e: record.totalKgCo2e,
      categories,
      createdAt: record.createdAt,
      recalculatedForAllocation: false,
      factorSnapshotAvailable: true,
    };
  }

  try {
    const inputs = JSON.parse(record.inputs) as Record<string, unknown>;
    const historicalFactors = Array.isArray(snapshot)
      ? snapshot as Factor[]
      : snapshot && typeof snapshot === "object" && Array.isArray((snapshot as { factors?: unknown }).factors)
        ? (snapshot as { factors: Factor[] }).factors
        : [];
    const corrected = calculateFootprint(inputs, historicalFactors);
    return {
      id: record.id,
      totalKgCo2e: corrected.totalKg,
      categories: corrected.categories.map(({ key, label, kgCo2e }) => ({ key, label, kgCo2e })),
      createdAt: record.createdAt,
      recalculatedForAllocation: true,
      factorSnapshotAvailable: historicalFactors.length > 0,
    };
  } catch {
    // Preserve the stored value only when its original inputs cannot be read.
    // The caller can expose this legacy limitation rather than inventing data.
    let categories: ResolvedFootprint["categories"] = [];
    try {
      categories = JSON.parse(record.categories) as ResolvedFootprint["categories"];
    } catch {
      // Leave the unavailable breakdown empty.
    }
    return {
      id: record.id,
      totalKgCo2e: record.totalKgCo2e,
      categories,
      createdAt: record.createdAt,
      recalculatedForAllocation: false,
      factorSnapshotAvailable: false,
    };
  }
}
