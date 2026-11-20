import { NextRequest, NextResponse } from "next/server";
import { loginUser, publicUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** POST /api/auth/login */
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "auth-login", 5, 15 * 60_000);
  if (limited) return limited;
  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "A JSON object is required." }, { status: 400 });
    }
    const payload = body as Record<string, unknown>;
    const email = String(payload.email || "").trim().toLowerCase();
    const password = String(payload.password || "");
    if (email.length > 254 || password.length > 128) return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
    const user = await loginUser(email, password);
    return NextResponse.json({ user: publicUser(user) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "login failed" }, { status: 401 });
  }
}
