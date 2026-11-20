import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { FACTORS } from "@/lib/factors";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const ACTIVITIES = ["shower", "toilet", "laundry", "dishes", "cooking", "drinking", "cleaning", "garden", "other"];

/** GET /api/water — logs + summary (7-day and 30-day averages). */
export async function GET(req: NextRequest) {
  const limited = rateLimit(req, "water-get", 80, 60000);
  if (limited) return limited;
  try {
    const user = await getOrCreateUser();
    const since = new Date(Date.now() - 30 * 86400000);
    const logs = await db.waterLog.findMany({ where: { userId: user.id, date: { gte: since } }, orderBy: { date: "desc" }, take: 400 });
    const byActivity = new Map<string, number>();
    for (const l of logs) byActivity.set(l.activity, (byActivity.get(l.activity) ?? 0) + l.liters);
    const total30 = logs.reduce((s, l) => s + l.liters, 0);
    const weekLogs = logs.filter((l) => new Date(l.date).getTime() >= Date.now() - 7 * 86400000);
    const total7 = weekLogs.reduce((s, l) => s + l.liters, 0);
    return NextResponse.json({
      logs: logs.map((l) => ({ id: l.id, activity: l.activity, liters: l.liters, date: l.date })),
      summary: {
        total30Days: total30,
        total7Days: total7,
        avgPerDay: total30 > 0 ? total30 / 30 : null,
        byActivity: Object.fromEntries(byActivity),
        co2eKg30Days: (total30 / 1000) * FACTORS.water_supply_treatment.value,
        method: `Supply + treatment emissions estimated with the published water factor (${FACTORS.water_supply_treatment.value} kgCO2e/m3, DEFRA 2023) applied to your logged volume.`,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "load failed" }, { status: 500 });
  }
}

/** POST /api/water — log usage. */
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "water-post", 60, 60000);
  if (limited) return limited;
  try {
    const user = await getOrCreateUser();
    const body = await req.json();
    const activity = ACTIVITIES.includes(body.activity) ? body.activity : null;
    const liters = Number(body.liters);
    if (!activity) return NextResponse.json({ error: "Activity is required." }, { status: 400 });
    if (!Number.isFinite(liters) || liters <= 0 || liters > 10000) {
      return NextResponse.json({ error: "Litres must be between 0 and 10,000." }, { status: 400 });
    }
    const date = body.date ? new Date(body.date) : new Date();
    if (Number.isNaN(date.getTime())) return NextResponse.json({ error: "Invalid date." }, { status: 400 });
    const log = await db.waterLog.create({ data: { userId: user.id, activity, liters, date } });
    return NextResponse.json({ log });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "save failed" }, { status: 500 });
  }
}
