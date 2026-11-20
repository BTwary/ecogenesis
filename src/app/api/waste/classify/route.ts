import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/waste/classify
 * VLM-assisted disposal guidance for a user-uploaded item photo.
 * The model identifies the item and material; ECOGENESIS adds the mandatory
 * caveat that recyclability depends on LOCAL rules and never claims an item
 * is recyclable without that caveat.
 */
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "classify-post", 5, 60000);
  if (limited) return limited;
  try {
    await getOrCreateUser();
    const body = await req.json();
    const imageDataUrl = String(body.image || "");
    const match = imageDataUrl.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: "Please upload a PNG, JPEG or WebP image (max 4 MB)." }, { status: 400 });
    }
    const base64 = match[2];
    if (base64.length > 4 * 1024 * 1024 * 0.75) {
      return NextResponse.json({ error: "Image too large. Please upload an image under 4 MB." }, { status: 400 });
    }

    const { default: ZAI } = await import("z-ai-web-dev-sdk");
    const zai = await ZAI.create();
    const completion = await (zai.chat.completions.createVision as any)({
      model: "glm-4v",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "You are ECOGENESIS waste-sorting assistant. Identify the main item in this photo. " +
                "Respond in strict JSON only with keys: item (short name), material (main material), " +
                "category (one of plastic|paper|organic|glass|metal|ewaste|hazardous|textile|other), " +
                "guidance (2-4 sentences on how to dispose of it responsibly), " +
                "recyclabilityNote (explain what usually determines whether this is recyclable locally: resin codes, contamination, facility availability), " +
                "confidence (high|medium|low). Never state the item is definitely recyclable; always defer to local municipal rules.",
            },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
      thinking: { type: "disabled" },
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    let parsed: Record<string, string> | null = null;
    try {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = null;
    }
    if (!parsed || !parsed.item) {
      return NextResponse.json({ error: "Could not analyse the image. Try a clearer photo of a single item." }, { status: 422 });
    }
    return NextResponse.json({
      classification: {
        item: String(parsed.item).slice(0, 120),
        material: String(parsed.material ?? "unknown").slice(0, 120),
        category: ["plastic", "paper", "organic", "glass", "metal", "ewaste", "hazardous", "textile", "other"].includes(parsed.category)
          ? parsed.category
          : "other",
        guidance: String(parsed.guidance ?? "").slice(0, 1200),
        recyclabilityNote: String(parsed.recyclabilityNote ?? "").slice(0, 1200),
        confidence: ["high", "medium", "low"].includes(parsed.confidence) ? parsed.confidence : "medium",
      },
      disclaimer:
        "AI identification is an aid, not an authority. Whether an item is recyclable depends on your municipal rules and the state of the item (cleanliness, composite materials). Always confirm with your local recycling programme.",
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : "classification failed";
    return NextResponse.json({
      error: "Photo-based waste identification needs an available image-capable AI provider. The text-based waste guide and manual waste logging remain available.",
      detail: process.env.NODE_ENV === "development" ? detail : undefined,
    }, { status: 503 });
  }
}
