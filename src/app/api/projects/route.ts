import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const CATEGORIES = ["restoration", "tree-planting", "recycling", "renewable", "cleanup", "biodiversity", "water", "education"];
const STATUSES = ["planned", "active", "completed"];

/**
 * Demonstrations dataset — CLEARLY MARKED demonstration entries used to
 * illustrate the community/map UI. They are NOT real projects. Real entries
 * are created by users (isDemo=false). Impact claims on demo entries are
 * labelled "illustrative".
 */
const DEMO_PROJECTS = [
  { title: "Rooftop Native Garden Pilot", description: "Demonstration entry showing how a community native-plant rooftop garden would appear in the platform, including pollinator tracking.", category: "biodiversity", status: "active", lat: 28.6139, lng: 77.209, placeName: "New Delhi (demo)", impactClaim: "Illustrative: 40 native plants, pollinator observation log", },
  { title: "Lakeside Clean-up Drive", description: "Demonstration entry for a weekend clean-up campaign with participant tracking and waste-logging.", category: "cleanup", status: "planned", lat: 12.9716, lng: 77.5946, placeName: "Bengaluru (demo)", impactClaim: "Illustrative: 50 participants, waste logged via the waste module", },
  { title: "School Solar Awareness Programme", description: "Demonstration entry for a school programme pairing the solar calculator with real NASA POWER data for the campus.", category: "renewable", status: "active", lat: 19.076, lng: 72.8777, placeName: "Mumbai (demo)", impactClaim: "Illustrative: solar-potential assessments for 10 rooftops", },
  { title: "Community Composting Hub", description: "Demonstration entry for a shared composting station; participants log diverted organic waste in the waste module.", category: "recycling", status: "active", lat: 13.0827, lng: 80.2707, placeName: "Chennai (demo)", impactClaim: "Illustrative: 120 kg/month organic waste composted", },
  { title: "Rainwater Harvesting Retrofit", description: "Demonstration entry for a housing-society rainwater retrofit planned with the ECOGENESIS rainwater calculator (real ERA5 rainfall data).", category: "water", status: "completed", lat: 17.385, lng: 78.4867, placeName: "Hyderabad (demo)", impactClaim: "Illustrative: ~85,000 L/year estimated collection", },
  { title: "Neighbourhood Tree Plantation", description: "Demonstration entry for a native-tree plantation. Verified planting counts require photographic evidence — entries start as self-reported.", category: "tree-planting", status: "active", lat: 22.5726, lng: 88.3639, placeName: "Kolkata (demo)", impactClaim: "Illustrative: 60 saplings planted, survival tracking planned", },
  { title: "Campus Biodiversity Atlas", description: "Demonstration entry for a student-led biodiversity survey using GBIF data plus on-campus observation submissions.", category: "education", status: "planned", lat: 23.0225, lng: 72.5714, placeName: "Ahmedabad (demo)", impactClaim: "Illustrative: target 100 documented species", },
  { title: "Riverbank Habitat Restoration", description: "Demonstration entry for removing invasive species and replanting native riparian vegetation along a degraded riverbank section.", category: "restoration", status: "active", lat: 9.9312, lng: 76.2673, placeName: "Kochi (demo)", impactClaim: "Illustrative: 500 m stretch, quarterly monitoring", },
];

async function ensureDemoSeed() {
  const count = await db.project.count({ where: { isDemo: true } });
  if (count > 0) return;
  await db.project.createMany({
    data: DEMO_PROJECTS.map((p) => ({
      ...p,
      verification: "self-reported",
      isDemo: true,
      sourceNote: "Demonstration dataset provided by ECOGENESIS to illustrate the platform. Not a real project.",
      orgName: "ECOGENESIS demo",
    })),
  });
}

/** GET /api/projects?category=&status=&q= — community + map projects. */
export async function GET(req: NextRequest) {
  const limited = rateLimit(req, "projects-get", 80, 60000);
  if (limited) return limited;
  try {
    const user = await getOrCreateUser();
    await ensureDemoSeed();
    const sp = req.nextUrl.searchParams;
    const category = sp.get("category") || undefined;
    const status = sp.get("status") || undefined;
    const q = sp.get("q")?.trim();

    const projects = await db.project.findMany({
      where: {
        ...(category && CATEGORIES.includes(category) ? { category } : {}),
        ...(status && STATUSES.includes(status) ? { status } : {}),
        ...(q ? { OR: [{ title: { contains: q } }, { description: { contains: q } }, { placeName: { contains: q } }] } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { participations: { select: { userId: true } }, comments: { select: { id: true } } },
    });

    return NextResponse.json({
      projects: projects.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        category: p.category,
        status: p.status,
        lat: p.lat,
        lng: p.lng,
        placeName: p.placeName,
        orgName: p.orgName,
        impactClaim: p.impactClaim,
        verification: p.verification,
        isDemo: p.isDemo,
        sourceNote: p.sourceNote,
        createdAt: p.createdAt,
        participantCount: p.participations.length,
        joined: p.participations.some((x) => x.userId === user.id),
        commentCount: p.comments.length,
      })),
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "load failed" }, { status: 500 });
  }
}

/** POST /api/projects — create a real community project (never auto-verified). */
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "projects-post", 10, 60000);
  if (limited) return limited;
  try {
    const user = await getOrCreateUser();
    const body = await req.json();
    const title = String(body.title || "").trim().slice(0, 140);
    const description = String(body.description || "").trim().slice(0, 2000);
    const category = CATEGORIES.includes(body.category) ? body.category : null;
    const status = STATUSES.includes(body.status) ? body.status : "planned";
    const lat = Number(body.lat);
    const lng = Number(body.lng);
    const placeName = String(body.placeName || "").trim().slice(0, 120);
    const impactClaim = body.impactClaim ? String(body.impactClaim).slice(0, 500) : null;

    if (!title || !description || !category || !placeName) {
      return NextResponse.json({ error: "Title, description, category and location name are required." }, { status: 400 });
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return NextResponse.json({ error: "Valid latitude and longitude are required." }, { status: 400 });
    }

    const project = await db.project.create({
      data: {
        title, description, category, status, lat, lng, placeName,
        orgName: body.orgName ? String(body.orgName).slice(0, 120) : null,
        impactClaim,
        verification: "self-reported",
        isDemo: false,
        sourceNote: "Community-submitted entry. Impact claims are self-reported until evidence is reviewed.",
        createdById: user.id,
      },
    });
    return NextResponse.json({ project: { id: project.id } });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "create failed" }, { status: 500 });
  }
}
