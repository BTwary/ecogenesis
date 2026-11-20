import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

/**
 * Lightweight, self-contained session layer.
 *
 * - First visit: an anonymous (guest) user row is created so every feature
 *   (calculators, goals, logs, projects) persists out of the box.
 * - Registering or logging in upgrades the SAME row, so guest data is kept.
 * - The session cookie is HMAC-signed; no third-party auth dependency.
 */

const COOKIE_NAME = process.env.NODE_ENV === "production" ? "__Host-eco_session" : "eco_session";
let developmentSecret: string | null = null;
function getAuthSecret(): string {
  const configured = process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "production") {
    if (!configured || configured.length < 32) {
      throw new Error("AUTH_SECRET must be configured with at least 32 characters in production.");
    }
    return configured;
  }
  // A development-only ephemeral secret avoids a known, reusable default.
  if (configured) return configured;
  developmentSecret ??= crypto.randomBytes(32).toString("hex");
  return developmentSecret!;
}
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function sign(userId: string): string {
  return crypto.createHmac("sha256", getAuthSecret()).update(userId).digest("hex").slice(0, 40);
}

function verifyToken(token: string): string | null {
  const idx = token.lastIndexOf(".");
  if (idx <= 0) return null;
  const userId = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = sign(userId);
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  return userId;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function checkPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64).toString("hex");
  return candidate.length === hash.length &&
    crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(hash));
}

async function setSessionCookie(userId: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, `${userId}.${sign(userId)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getSessionUser() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const userId = verifyToken(token);
  if (!userId) return null;
  try {
    return await db.user.findUnique({ where: { id: userId } });
  } catch {
    return null;
  }
}

/** Returns the current user; creates an anonymous guest user + cookie if none. */
export async function getOrCreateUser() {
  const existing = await getSessionUser();
  if (existing) return existing;
  const user = await db.user.create({
    data: { isAnonymous: true, name: "Guest", accountType: "individual" },
  });
  await setSessionCookie(user.id);
  return user;
}

export async function registerCurrentUser(email: string, password: string, name?: string, accountType?: string) {
  const user = await getOrCreateUser();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing && existing.id !== user.id) {
    throw new Error("An account with this email already exists. Please log in instead.");
  }
  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      email,
      passwordHash: hashPassword(password),
      name: name || user.name,
      accountType: accountType || user.accountType,
      isAnonymous: false,
    },
  });
  return updated;
}

export async function loginUser(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash || !checkPassword(password, user.passwordHash)) {
    throw new Error("Invalid email or password.");
  }
  await setSessionCookie(user.id);
  return user;
}

export async function logoutUser() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export function publicUser(user: {
  id: string;
  email: string | null;
  name: string | null;
  accountType: string;
  isAnonymous: boolean;
  createdAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    accountType: user.accountType,
    isAnonymous: user.isAnonymous,
    createdAt: user.createdAt,
  };
}
