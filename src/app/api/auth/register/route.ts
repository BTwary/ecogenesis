import { NextRequest, NextResponse } from "next/server";
import { registerCurrentUser, publicUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** POST /api/auth/register — upgrades the current guest session to a named account (data is kept). */
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "auth-register", 5, 60 * 60_000);
  if (limited) return limited;
  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "A JSON object is required." }, { status: 400 });
    }
    const payload = body as Record<string, unknown>;
    const email = String(payload.email || "").trim().toLowerCase();
    const password = String(payload.password || "");
    const name = payload.name ? String(payload.name).trim().slice(0, 80) : undefined;
    const accountType = String(payload.accountType || "individual");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (email.length > 254) return NextResponse.json({ error: "Email address is too long." }, { status: 400 });
    if (password.length < 8 || password.length > 128) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    const allowedTypes = new Set(["individual", "household", "school", "business", "ngo", "community"]);
    if (!allowedTypes.has(accountType)) return NextResponse.json({ error: "Unsupported account type." }, { status: 400 });
    const user = await registerCurrentUser(email, password, name, accountType);
    return NextResponse.json({ user: publicUser(user) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "registration failed" }, { status: 400 });
  }
}
