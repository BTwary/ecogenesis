import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getOrCreateUser, publicUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/auth/me — returns current session user (creates guest if none). */
export async function GET(req: NextRequest) {
  const limited = rateLimit(req, "auth-me", 60, 60_000);
  if (limited) return limited;
  try {
    const user = await getOrCreateUser();
    return NextResponse.json({ user: publicUser(user) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "session error" }, { status: 500 });
  }
}
