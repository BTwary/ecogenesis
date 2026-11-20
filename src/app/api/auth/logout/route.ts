import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { logoutUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** POST /api/auth/logout — clears the session cookie. */
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "auth-logout", 30, 60_000);
  if (limited) return limited;
  await logoutUser();
  return NextResponse.json({ ok: true });
}
