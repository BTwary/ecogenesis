import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const limited = rateLimit(req, "root-api", 60, 60_000);
  if (limited) return limited;
  return NextResponse.json({ message: "Hello, world!" });
}