import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** POST /api/goals/status — mark a goal completed or cancelled. */
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "status-post", 30, 60000);
  if (limited) return limited;
  try {
    const user = await getOrCreateUser();
    const body = await req.json();
    const goal = await db.goal.findFirst({ where: { id: String(body.goalId || ""), userId: user.id } });
    if (!goal) return NextResponse.json({ error: "Goal not found." }, { status: 404 });
    const status = ["active", "completed", "cancelled"].includes(body.status) ? body.status : null;
    if (!status) return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    const updated = await db.goal.update({ where: { id: goal.id }, data: { status } });
    return NextResponse.json({ goal: updated });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "update failed" }, { status: 500 });
  }
}
