import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const KINDS = ["flora", "fauna", "fungi", "habitat"];

/**
 * GET /api/observations — community biodiversity submissions.
 * Location is returned rounded to 3 decimals (~100 m) as a privacy measure;
 * exact coordinates are visible only to the submitter.
 */
export async function GET(req: NextRequest) {
  const limited = rateLimit(req, "observations-get", 60, 60000);
  if (limited) return limited;
  try {
    const user = await getOrCreateUser();
    const obs = await db.observation.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { user: { select: { name: true } } } });
    return NextResponse.json({
      observations: obs.map((o) => ({
        id: o.id,
        speciesGuess: o.speciesGuess,
        kind: o.kind,
        notes: o.notes,
        photo: o.photo,
        placeName: o.placeName,
        // privacy: only owner sees exact coordinates
        lat: o.userId === user.id ? o.lat : o.lat != null ? Math.round(o.lat * 1000) / 1000 : null,
        lng: o.userId === user.id ? o.lng : o.lng != null ? Math.round(o.lng * 1000) / 1000 : null,
        isOwn: o.userId === user.id,
        observer: o.user.name ?? "Anonymous observer",
        createdAt: o.createdAt,
      })),
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "load failed" }, { status: 500 });
  }
}

/** POST /api/observations — submit an observation (photo optional, size-capped). */
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "observations-post", 12, 60000);
  if (limited) return limited;
  try {
    const user = await getOrCreateUser();
    const body = await req.json();
    const speciesGuess = String(body.speciesGuess || "").trim().slice(0, 160);
    if (!speciesGuess) return NextResponse.json({ error: "Species name or your best guess is required." }, { status: 400 });
    const kind = KINDS.includes(body.kind) ? body.kind : "flora";
    const notes = body.notes ? String(body.notes).slice(0, 1000) : null;
    const placeName = body.placeName ? String(body.placeName).slice(0, 120) : null;

    let lat: number | null = null;
    let lng: number | null = null;
    if (body.lat != null && body.lng != null) {
      lat = Number(body.lat);
      lng = Number(body.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        lat = null;
        lng = null;
      }
    }

    let photo: string | null = null;
    if (body.photo && typeof body.photo === "string") {
      const m = body.photo.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
      if (!m) return NextResponse.json({ error: "Photo must be a PNG, JPEG or WebP data URL." }, { status: 400 });
      if (m[2].length > 1.5 * 1024 * 1024) {
        return NextResponse.json({ error: "Photo too large — please keep it under ~1.5 MB." }, { status: 400 });
      }
      photo = body.photo;
    }

    const obs = await db.observation.create({
      data: { userId: user.id, speciesGuess, kind, notes, placeName, lat, lng, photo },
    });
    return NextResponse.json({ observation: { id: obs.id, createdAt: obs.createdAt } });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "save failed" }, { status: 500 });
  }
}
