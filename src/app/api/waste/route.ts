import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { FACTORS } from "@/lib/factors";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const CATEGORIES = ["plastic", "paper", "organic", "glass", "metal", "ewaste", "hazardous", "textile", "other"];
const DISPOSALS = ["recycled", "landfill", "compost", "reused", "hazardous-facility", "unknown"];

/** GET /api/waste — logs + aggregate summary. */
export async function GET(req: NextRequest) {
  const limited = rateLimit(req, "waste-get", 80, 60000);
  if (limited) return limited;
  try {
    const user = await getOrCreateUser();
    const logs = await db.wasteLog.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 200 });
    const byCategory = new Map<string, number>();
    const byDisposal = new Map<string, number>();
    for (const l of logs) {
      byCategory.set(l.category, (byCategory.get(l.category) ?? 0) + l.kg);
      byDisposal.set(l.disposal, (byDisposal.get(l.disposal) ?? 0) + l.kg);
    }
    const landfillKg = byDisposal.get("landfill") ?? 0;
    const recycledKg = byDisposal.get("recycled") ?? 0;
    const compostedKg = byDisposal.get("compost") ?? 0;
    const reusedKg = byDisposal.get("reused") ?? 0;
    // Deterministic avoidance estimate from the published factor pair:
    const avoidedKgCo2e =
      landfillKg * FACTORS.waste_landfill.value -
      recycledKg * FACTORS.waste_recycled.value -
      compostedKg * FACTORS.waste_composted.value;
    return NextResponse.json({
      logs: logs.map((l) => ({ id: l.id, category: l.category, disposal: l.disposal, item: l.item, kg: l.kg, createdAt: l.createdAt })),
      summary: {
        totalKg: logs.reduce((s, l) => s + l.kg, 0),
        byCategory: Object.fromEntries(byCategory),
        byDisposal: Object.fromEntries(byDisposal),
        landfillKg,
        recycledKg,
        compostedKg,
        reusedKg,
        landfillDiversionPercent: landfillKg + recycledKg + compostedKg + reusedKg > 0
          ? ((recycledKg + compostedKg + reusedKg) / (landfillKg + recycledKg + compostedKg + reusedKg)) * 100
          : null,
        avoidedKgCo2e: Math.max(0, avoidedKgCo2e),
        avoidanceMethod: `Landfill factor ${FACTORS.waste_landfill.value} kgCO2e/kg minus recycling (${FACTORS.waste_recycled.value}) and composting (${FACTORS.waste_composted.value}) factors applied to your logged amounts. Deterministic arithmetic on logged data — an estimate, not a measurement.`,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "load failed" }, { status: 500 });
  }
}

/** POST /api/waste — log a waste item. */
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "waste-post", 30, 60000);
  if (limited) return limited;
  try {
    const user = await getOrCreateUser();
    const body = await req.json();
    const category = CATEGORIES.includes(body.category) ? body.category : null;
    const disposal = DISPOSALS.includes(body.disposal) ? body.disposal : null;
    const kg = Number(body.kg);
    if (!category || !disposal) return NextResponse.json({ error: "Category and disposal method are required." }, { status: 400 });
    if (!Number.isFinite(kg) || kg <= 0 || kg > 5000) return NextResponse.json({ error: "Weight must be between 0 and 5000 kg." }, { status: 400 });
    const item = String(body.item || "").trim().slice(0, 200) || "Unspecified item";
    const log = await db.wasteLog.create({ data: { userId: user.id, category, disposal, item, kg } });
    return NextResponse.json({ log });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "save failed" }, { status: 500 });
  }
}
