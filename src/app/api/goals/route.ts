import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const CATEGORIES = ["energy", "water", "waste", "transport", "food", "nature", "general"];

/** GET /api/goals — user's goals with aggregated progress. */
export async function GET(req: NextRequest) {
  const limited = rateLimit(req, "goals-get", 80, 60000);
  if (limited) return limited;
  try {
    const user = await getOrCreateUser();
    const goals = await db.goal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { progress: { orderBy: { date: "asc" } } },
    });
    return NextResponse.json({
      goals: goals.map((g) => {
        const sum = g.progress.reduce((s, p) => s + p.value, 0);
        const pct = g.target && g.target > 0 ? Math.min(100, (sum / g.target) * 100) : null;
        return {
          id: g.id,
          title: g.title,
          category: g.category,
          target: g.target,
          unit: g.unit,
          period: g.period,
          startDate: g.startDate,
          endDate: g.endDate,
          status: g.status,
          createdAt: g.createdAt,
          progressSum: sum,
          progressPercent: pct,
          progress: g.progress.map((p) => ({ id: p.id, date: p.date, value: p.value, note: p.note })),
        };
      }),
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "load failed" }, { status: 500 });
  }
}

/** POST /api/goals — create a goal or challenge. */
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "goals-post", 20, 60000);
  if (limited) return limited;
  try {
    const user = await getOrCreateUser();
    const body = await req.json();
    const title = String(body.title || "").trim().slice(0, 140);
    if (!title) return NextResponse.json({ error: "A goal title is required." }, { status: 400 });
    const category = CATEGORIES.includes(body.category) ? body.category : "general";
    const target = body.target != null && Number.isFinite(Number(body.target)) ? Number(body.target) : null;
    const unit = body.unit ? String(body.unit).slice(0, 30) : null;
    const period = ["week", "month", "custom"].includes(body.period) ? body.period : "month";
    const days = Math.min(365, Math.max(1, Number(body.durationDays) || 30));
    const startDate = new Date();
    const endDate = period === "custom" ? new Date(startDate.getTime() + days * 86400000) : null;

    const goal = await db.goal.create({
      data: { userId: user.id, title, category, target, unit, period, startDate, endDate },
    });
    return NextResponse.json({ goal });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "create failed" }, { status: 500 });
  }
}
