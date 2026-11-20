import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** POST /api/goals/progress — log progress against a goal (value>0). */
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "progress-post", 60, 60000);
  if (limited) return limited;
  try {
    const user = await getOrCreateUser();
    const body = await req.json();
    const goal = await db.goal.findFirst({
      where: { id: String(body.goalId || ""), userId: user.id },
    });
    if (!goal) return NextResponse.json({ error: "Goal not found." }, { status: 404 });
    const value = Number(body.value);
    if (!Number.isFinite(value) || value <= 0) {
      return NextResponse.json({ error: "Progress value must be a positive number." }, { status: 400 });
    }
    const note = body.note ? String(body.note).slice(0, 300) : null;
    const progress = await db.goalProgress.create({
      data: { goalId: goal.id, date: new Date(), value, note },
    });

    // auto-complete when cumulative progress reaches target
    if (goal.target && goal.target > 0) {
      const sum = await db.goalProgress.aggregate({ where: { goalId: goal.id }, _sum: { value: true } });
      if ((sum._sum.value ?? 0) >= goal.target && goal.status === "active") {
        await db.goal.update({ where: { id: goal.id }, data: { status: "completed" } });
      }
    }
    return NextResponse.json({ progress });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "log failed" }, { status: 500 });
  }
}
