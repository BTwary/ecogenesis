import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { FACTORS } from "@/lib/factors";
import { resolveFootprintRecord } from "@/lib/footprint-record";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * GET /api/reports/export?format=csv
 * Genuine CSV export of the user's tracked data with a methodology header.
 */
export async function GET(req: NextRequest) {
  const limited = rateLimit(req, "report-export", 10, 60_000);
  if (limited) return limited;
  const format = req.nextUrl.searchParams.get("format") || "csv";
  if (format !== "csv") return NextResponse.json({ error: "Only csv format is supported." }, { status: 400 });

  const user = await getOrCreateUser();
  const [footprints, waste, water, goals] = await Promise.all([
    db.footprintResult.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
    db.wasteLog.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" }, take: 1000 }),
    db.waterLog.findMany({ where: { userId: user.id }, orderBy: { date: "asc" }, take: 1000 }),
    db.goal.findMany({ where: { userId: user.id }, include: { progress: true }, orderBy: { createdAt: "asc" }, take: 500 }),
  ]);

  const esc = (v: string | number | null | undefined) => {
    const s = v === null || v === undefined ? "" : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };

  const lines: string[] = [];
  lines.push("# ECOGENESIS data export — generated " + new Date().toISOString());
  lines.push("# All values are self-reported entries or platform estimates; see methodology notes in each section.");
  lines.push("# Footprint estimates use published emission factors (DEFRA 2023, CEA v21.0, Scarborough et al. 2014, Global Carbon Budget 2023).");
  lines.push("# Footprint total and categories are allocated per-person annual CO2e estimates; shared household energy, water and waste are divided across household size.");
  lines.push("");
  lines.push("## FOOTPRINT RESULTS");
  lines.push("timestamp,per_person_total_kg_co2e,per_person_transport_kg,per_person_energy_kg,per_person_food_kg,per_person_goods_kg,per_person_waste_kg,per_person_water_kg");
  for (const f of footprints) {
    const resolved = resolveFootprintRecord(f);
    const g = (k: string) => resolved.categories.find((c) => c.key === k)?.kgCo2e ?? 0;
    lines.push([esc(f.createdAt.toISOString()), esc(resolved.totalKgCo2e.toFixed(1)), esc(g("transport").toFixed(1)), esc(g("energy").toFixed(1)), esc(g("food").toFixed(1)), esc(g("goods").toFixed(1)), esc(g("waste").toFixed(1)), esc(g("water").toFixed(1))].join(","));
  }
  lines.push("");
  lines.push("## WASTE LOGS (methodology: " + FACTORS.waste_landfill.source + ")");
  lines.push("timestamp,item,category,disposal,kg");
  for (const w of waste) {
    lines.push([esc(w.createdAt.toISOString()), esc(w.item), esc(w.category), esc(w.disposal), esc(w.kg)].join(","));
  }
  lines.push("");
  lines.push("## WATER LOGS (methodology: " + FACTORS.water_supply_treatment.source + ")");
  lines.push("date,activity,liters");
  for (const w of water) {
    lines.push([esc(w.date.toISOString().slice(0, 10)), esc(w.activity), esc(w.liters)].join(","));
  }
  lines.push("");
  lines.push("## GOALS & PROGRESS");
  lines.push("goal_title,category,status,target,unit,progress_sum,progress_entries");
  for (const g of goals) {
    const sum = g.progress.reduce((s, p) => s + p.value, 0);
    lines.push([esc(g.title), esc(g.category), esc(g.status), esc(g.target ?? ""), esc(g.unit ?? ""), esc(sum.toFixed(2)), esc(g.progress.length)].join(","));
  }

  const csv = lines.join("\n");
  const filename = `ecogenesis-export-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
