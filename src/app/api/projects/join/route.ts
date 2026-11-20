import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** POST /api/projects/join — join or leave a project. */
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "join-post", 20, 60000);
  if (limited) return limited;
  try {
    const user = await getOrCreateUser();
    const body = await req.json();
    const projectId = String(body.projectId || "");
    const project = await db.project.findUnique({ where: { id: projectId } });
    if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });

    const existing = await db.participation.findUnique({
      where: { projectId_userId: { projectId, userId: user.id } },
    });
    if (body.action === "leave") {
      if (existing) await db.participation.delete({ where: { id: existing.id } });
      return NextResponse.json({ joined: false });
    }
    if (!existing) {
      await db.participation.create({ data: { projectId, userId: user.id } });
    }
    return NextResponse.json({ joined: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "join failed" }, { status: 500 });
  }
}
