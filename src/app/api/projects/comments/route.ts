import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** GET /api/projects/comments?projectId=.. */
export async function GET(req: NextRequest) {
  const limited = rateLimit(req, "comments-get", 80, 60000);
  if (limited) return limited;
  try {
    const projectId = req.nextUrl.searchParams.get("projectId") || "";
    const comments = await db.comment.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
      take: 100,
      include: { user: { select: { name: true, isAnonymous: true } } },
    });
    return NextResponse.json({
      comments: comments.map((c) => ({
        id: c.id,
        body: c.body,
        author: c.user.isAnonymous ? "Guest participant" : c.user.name ?? "Member",
        createdAt: c.createdAt,
      })),
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "load failed" }, { status: 500 });
  }
}

/** POST /api/projects/comments */
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "comments-post", 30, 60000);
  if (limited) return limited;
  try {
    const user = await getOrCreateUser();
    const body = await req.json();
    const projectId = String(body.projectId || "");
    const text = String(body.body || "").trim().slice(0, 800);
    if (!text) return NextResponse.json({ error: "Comment cannot be empty." }, { status: 400 });
    const project = await db.project.findUnique({ where: { id: projectId } });
    if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
    const comment = await db.comment.create({ data: { projectId, userId: user.id, body: text } });
    return NextResponse.json({
      comment: {
        id: comment.id,
        body: comment.body,
        author: user.isAnonymous ? "Guest participant" : user.name ?? "Member",
        createdAt: comment.createdAt,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "save failed" }, { status: 500 });
  }
}
