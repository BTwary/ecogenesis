import { NextRequest, NextResponse } from "next/server";
import { fetchGbif } from "@/lib/data-sources/connectors";
import { logConnector } from "@/lib/data-sources/cache";
import { PROVIDER_NAMES } from "@/lib/data-sources/types";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * GET /api/env/biodiversity?lat=..&lng=..&radiusKm=10
 * GBIF occurrence snapshot near a coordinate. Returns the total record count,
 * top observed species and recent records with provenance.
 */
export async function GET(req: NextRequest) {
  const limited = rateLimit(req, "env-biodiversity", 20, 60000);
  if (limited) return limited;
  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lng = Number(req.nextUrl.searchParams.get("lng"));
  const radiusKm = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get("radiusKm")) || 10));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: "Valid lat/lng required" }, { status: 400 });
  }

  try {
    const t0 = Date.now();
    const snap = await fetchGbif(lat, lng, radiusKm);
    await logConnector("gbif", "occurrence-search", "ok", `radius=${radiusKm}km`, Date.now() - t0);

    return NextResponse.json({
      location: { lat, lng },
      radiusKm,
      totalCount: snap.totalCount,
      sampledRecords: snap.sampled,
      speciesCounts: snap.speciesCounts,
      recent: snap.recent,
      analytics: {
        methodology: `GBIF occurrence records within ~${radiusKm} km of the point (16-vertex circular polygon filter). ` +
          "Counts of the top species are computed from a sample of up to 300 returned records; the total count comes from the provider.",
        limitations: [
          "Occurrence data reflects where people (and sensors) look, not true species abundance.",
          "Coverage varies strongly by region; a low count does not prove low biodiversity.",
        ],
        confidence: snap.sampled > 0 ? "moderate — direct provider sample" : "low — empty sample",
      },
      provenance: {
        provider: "gbif",
        providerName: PROVIDER_NAMES.gbif,
        datasetId: "gbif_occurrence_snapshot",
        sourceUrl: "https://api.gbif.org/v1/occurrence/search",
        licence: "GBIF-mediated data — CC0/CC BY per underlying dataset; attribution: Global Biodiversity Information Facility",
        retrievedAt: new Date().toISOString(),
        cached: false,
        notes: "Live snapshot fetched per request (not a monitoring feed). Records include citizen-science and museum data; basisOfRecord is preserved per record upstream.",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "fetch failed";
    await logConnector("gbif", "occurrence-search", "error", msg);
    return NextResponse.json({ error: "GBIF unreachable — no biodiversity snapshot available.", detail: msg }, { status: 502 });
  }
}
