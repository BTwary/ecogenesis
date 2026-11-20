import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { BENCHMARKS } from "@/lib/factors";
import { resolveFootprintRecord } from "@/lib/footprint-record";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * GET /api/me/summary — engagement summary.
 * The "sustainability engagement score" is explicitly an engagement metric
 * computed from tracked activity — NOT a scientific environmental rating.
 */
export async function GET(req: NextRequest) {
  const limited = rateLimit(req, "summary-get", 60, 60000);
  if (limited) return limited;
  try {
    const user = await getOrCreateUser();
    const [footprints, goals, goalProgress, wasteLogs, waterLogs, observations, participations] = await Promise.all([
      db.footprintResult.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 24 }),
      db.goal.findMany({ where: { userId: user.id } }),
      db.goalProgress.findMany({ where: { goal: { userId: user.id } } }),
      db.wasteLog.count({ where: { userId: user.id } }),
      db.waterLog.count({ where: { userId: user.id } }),
      db.observation.count({ where: { userId: user.id } }),
      db.participation.count({ where: { userId: user.id } }),
    ]);

    const resolvedFootprints = footprints.map((record) => ({ record, resolved: resolveFootprintRecord(record) }));
    const latest = resolvedFootprints[0]?.resolved ?? null;
    const completedGoals = goals.filter((g) => g.status === "completed").length;
    const activeGoals = goals.filter((g) => g.status === "active").length;

    // Badges — awarded only for real, logged activity.
    const badges: { id: string; label: string; description: string; earned: boolean; evidence: string }[] = [
      { id: "first-footprint", label: "Baseline Measured", description: "Completed your first footprint calculation", earned: footprints.length >= 1, evidence: `${footprints.length} calculation(s) saved` },
      { id: "footprint-improver", label: "Getting Lighter", description: "Saved a footprint result lower than your previous one", earned: resolvedFootprints.length >= 2 && resolvedFootprints[0].resolved.totalKgCo2e < resolvedFootprints[1].resolved.totalKgCo2e, evidence: "Two calculations compared" },
      { id: "water-tracker", label: "Water Watcher", description: "Logged household water usage for at least 5 days", earned: new Set(waterLogs > 0 ? (await db.waterLog.findMany({ where: { userId: user.id }, select: { date: true }, take: 400 })).map((w) => w.date.toISOString().slice(0, 10)) : []).size >= 5, evidence: `${waterLogs} water log(s)` },
      { id: "waste-tracker", label: "Waste Auditor", description: "Logged 10 or more waste items", earned: wasteLogs >= 10, evidence: `${wasteLogs} waste log(s)` },
      { id: "goal-setter", label: "Planner", description: "Created your first sustainability goal", earned: goals.length >= 1, evidence: `${goals.length} goal(s) created` },
      { id: "goal-finisher", label: "Finisher", description: "Completed a sustainability goal", earned: completedGoals >= 1, evidence: `${completedGoals} goal(s) completed` },
      { id: "naturalist", label: "Naturalist", description: "Submitted a biodiversity observation", earned: observations >= 1, evidence: `${observations} observation(s)` },
      { id: "community", label: "Community Member", description: "Joined a community project", earned: participations >= 1, evidence: `${participations} project participation(s)` },
    ];

    // Engagement score (0-100): transparent weighted count of tracked actions.
    const components = [
      { label: "Footprint measured", max: 20, value: footprints.length > 0 ? 20 : 0 },
      { label: "Footprint trend tracked (2+ calculations)", max: 15, value: footprints.length >= 2 ? 15 : 0 },
      { label: "Goals created", max: 15, value: Math.min(15, goals.length * 5) },
      { label: "Goals completed", max: 20, value: Math.min(20, completedGoals * 10) },
      { label: "Water logs (5d+)", max: 10, value: waterLogs >= 5 ? 10 : 0 },
      { label: "Waste logs (10+)", max: 10, value: wasteLogs >= 10 ? 10 : 0 },
      { label: "Biodiversity submissions", max: 5, value: observations >= 1 ? 5 : 0 },
      { label: "Community participation", max: 5, value: participations >= 1 ? 5 : 0 },
    ];
    const score = components.reduce((s, c) => s + c.value, 0);

    return NextResponse.json({
      user: { name: user.name, accountType: user.accountType, isAnonymous: user.isAnonymous },
      footprint: latest
        ? { totalKg: latest.totalKgCo2e, categories: latest.categories, createdAt: latest.createdAt, history: resolvedFootprints.map(({ resolved }) => ({ totalKg: resolved.totalKgCo2e, createdAt: resolved.createdAt })) }
        : null,
      activity: { goalsTotal: goals.length, goalsActive: activeGoals, goalsCompleted: completedGoals, progressEntries: goalProgress.length, wasteLogs, waterLogs, observations, participations },
      score: {
        value: score,
        max: 100,
        components,
        disclaimer: "Engagement score: measures how much of the platform's tracking you are using. It is NOT a scientific environmental rating.",
      },
      badges,
      benchmarks: BENCHMARKS,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "summary failed" }, { status: 500 });
  }
}
