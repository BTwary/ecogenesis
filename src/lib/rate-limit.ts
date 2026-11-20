import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Best-effort per-process fixed-window limiter for a single app instance.
 * Multi-instance deployments must additionally enforce limits at the edge or
 * use a shared limiter; see README production notes.
 */
type Bucket = { count: number; resetAt: number };
type RateLimitStore = Map<string, Bucket>;
const globalRateLimit = globalThis as typeof globalThis & { __ecoRateLimitStore?: RateLimitStore };
const store = globalRateLimit.__ecoRateLimitStore ?? new Map<string, Bucket>();
if (process.env.NODE_ENV !== "production") globalRateLimit.__ecoRateLimitStore = store;

function clientIdentity(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const identity = forwarded || realIp || "unknown-client";
  // Avoid retaining raw IP addresses in memory or logs.
  return createHash("sha256").update(identity).digest("hex").slice(0, 24);
}

export function rateLimit(
  request: NextRequest,
  scope: string,
  limit: number,
  windowMs: number,
): NextResponse | null {
  const now = Date.now();
  const key = `${scope}:${clientIdentity(request)}`;
  let bucket = store.get(key);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
    store.set(key, bucket);
  }
  bucket.count += 1;

  // Opportunistic cleanup to keep the in-memory map bounded.
  if (store.size > 5000) {
    for (const [storedKey, value] of store) if (now >= value.resetAt) store.delete(storedKey);
  }

  const remaining = Math.max(0, limit - bucket.count);
  const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  if (bucket.count > limit) {
    return NextResponse.json(
      { error: "Too many requests. Please retry after the rate-limit window." },
      { status: 429, headers: { "Retry-After": String(retryAfter), "X-RateLimit-Limit": String(limit), "X-RateLimit-Remaining": "0" } },
    );
  }
  return null;
}
