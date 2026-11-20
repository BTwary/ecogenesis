import { NextRequest, NextResponse } from "next/server";
import { getIntegrationStatus } from "@/lib/data-sources/registry";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * GET /api/env/status
 * Source-by-source integration report (live probes, 5-minute cache) plus the
 * most recent connector log entries for auditability.
 */
export async function GET(req: NextRequest) {
  const limited = rateLimit(req, "env-status", 8, 60_000);
  if (limited) return limited;
  const sources = await getIntegrationStatus();
  let logs: { provider: string; endpoint: string; status: string; message: string | null; latencyMs: number | null; createdAt: Date }[] = [];
  try {
    logs = await db.connectorLog.findMany({ orderBy: { createdAt: "desc" }, take: 25 });
  } catch {
    // database not ready — status report still returned
  }
  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    summary: {
      operational: sources.filter((s) => s.status === "operational").length,
      requiresKey: sources.filter((s) => s.status === "requires-key").length,
      unavailable: sources.filter((s) => s.status === "unavailable").length,
    },
    sources,
    recentConnectorLogs: logs,
  });
}
