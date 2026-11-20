import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { resolveFootprintRecord } from "@/lib/footprint-record";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const SYSTEM_PROMPT = `You are the ECOGENESIS Sustainability Assistant — a rigorous, practical environmental advisor inside an environmental-intelligence platform.

INTEGRITY RULES (non-negotiable):
1. Never invent statistics, measurements or environmental savings. When you give numbers, you must either (a) derive them arithmetically from values the user provided plus well-known published factors you name, or (b) present them as explicit ranges from published research you name.
2. Distinguish clearly between: verified measurements, model/reanalysis data, published study values, and your qualitative guidance. Say which is which.
3. Never claim an item is recyclable without deferring to local municipal rules.
4. Never conflate carbon offsets with emissions reductions. Reductions first.
5. If you are uncertain, say so and state what data would be needed.
6. Confidence levels: label quantitative claims as "high / moderate / low confidence" and briefly say why.

RESPONSE FORMAT (for advice questions):
- The issue: 1-2 sentences on why this matters environmentally.
- Recommendations: 3-6 concrete, prioritised actions.
- Estimated benefit: honest ranges with the assumption stated, or "hard to quantify without more data".
- Difficulty and cost: low/medium/high with a short note.
- Sources & confidence: name the underlying published sources where numbers are used (e.g., DEFRA conversion factors, CEA India grid factor, IEA, Global Carbon Budget, Scarborough et al. 2014, FAO, NASA POWER, GBIF, Open-Meteo/ERA5).

STYLE: warm, direct, concise. Use short paragraphs and markdown lists. Max ~350 words unless the user asks for depth. If the user's context includes their footprint data, personalise the advice to it.`;


function localGuidanceFallback(message: string): string {
  const q = message.toLowerCase();
  let title = "Practical sustainability starting points";
  let actions: string[] = [
    "Measure the activity you want to improve before changing it, and keep the same measurement boundary when you compare periods.",
    "Prioritise actions that avoid resource use or waste at source before relying on recycling or offsets.",
    "Record the date, quantity, unit and evidence for each action so that progress can be checked later.",
  ];
  let issue = "I could not reach the optional AI provider, so this response uses ECOGENESIS's local guidance rules rather than a generative model.";

  if (/water|shower|tap|rainwater|leak|toilet/.test(q)) {
    title = "Reducing household water use";
    issue = "Water use is shaped by fixtures, household size, leakage, outdoor use and local supply conditions. Without meter readings, savings cannot be verified.";
    actions = [
      "Read the water meter at a consistent time each week and record the household size and any unusual use.",
      "Check taps, toilet cisterns and pipework for leaks; repair faults and compare meter readings afterwards.",
      "Measure shower flow in litres per minute and record shower duration before estimating possible reductions.",
      "For rainwater harvesting, use a documented local rainfall series, roof area, runoff coefficient and storage capacity; do not treat annual theoretical yield as guaranteed usable water.",
    ];
  } else if (/electric|energy|appliance|solar|panel|renewable|bill|kwh/.test(q)) {
    title = "Reducing electricity and energy use";
    issue = "The largest opportunities depend on the actual appliances, operating hours, local tariff and electricity-grid emissions factor.";
    actions = [
      "Collect monthly electricity-meter readings and, where possible, measure large appliances separately.",
      "Prioritise cooling, water heating, refrigeration and other large loads based on measured kWh rather than assumptions.",
      "Compare equipment efficiency labels and expected lifetime use before replacing a working appliance; include purchase and embodied impacts in the decision.",
      "For rooftop solar, check local irradiance, shading, roof orientation, structural suitability, installed cost, tariff and export rules before estimating payback.",
    ];
  } else if (/waste|plastic|recycl|compost|landfill|e-?waste/.test(q)) {
    title = "Reducing waste and improving disposal";
    issue = "Waste outcomes depend on material composition, contamination and what local collection and processing facilities actually accept.";
    actions = [
      "Prevent avoidable purchases and packaging first; reuse or repair products where safe and practical.",
      "Separate organic, dry recyclable, residual and hazardous/e-waste streams according to your municipal rules.",
      "Keep batteries, electronics, lamps, medicines, paints and chemicals out of general waste; use authorised collection routes.",
      "Weigh or count each waste stream over a consistent period before reporting diversion or reduction.",
    ];
  } else if (/transport|travel|car|commut|flight|train|bus/.test(q)) {
    title = "Reducing transport impact";
    issue = "Transport emissions depend on distance, vehicle type, occupancy, fuel, electricity mix and lifecycle boundary.";
    actions = [
      "Record trip distance and mode for a representative period before estimating your baseline.",
      "Where practical and safe, combine trips, share rides, or choose walking, cycling, public transport or rail instead of a solo car journey.",
      "For vehicle comparisons, use a consistent passenger-kilometre or vehicle-kilometre basis and include occupancy.",
      "For electric vehicles, use a regional electricity factor rather than assuming zero operational emissions.",
    ];
  } else if (/food|diet|meat|vegetarian|vegan|meal/.test(q)) {
    title = "Reducing food-related environmental impact";
    issue = "Food impacts vary by production method, food type, land-use change, transport, storage and waste. Avoid treating 'local' as automatically lower-impact.";
    actions = [
      "Plan meals and track avoidable food waste before estimating improvements.",
      "Where suitable for your needs, replace some high-impact meat meals with pulses, grains, vegetables or other lower-impact options.",
      "Store food correctly and use leftovers safely to avoid wasting the resources used to produce it.",
      "Use a recognised dietary footprint dataset if you need a numerical estimate, and state its geography and year.",
    ];
  } else if (/biodivers|species|bird|plant|tree|pollinat|wildlife|garden/.test(q)) {
    title = "Supporting local biodiversity";
    issue = "Biodiversity actions should be matched to local ecology. Species records show observations, not population abundance or proof that a species is absent.";
    actions = [
      "Choose locally native plants after checking with a regional botanical or forestry authority.",
      "Avoid pesticides where possible and provide suitable habitat, shelter and water appropriate to the local ecosystem.",
      "Record observations with date, broad location, species identification confidence and photographs where appropriate.",
      "Use GBIF occurrence records as evidence of reported observations, not as a complete census of local wildlife.",
    ];
  } else if (/business|company|office|organisation|organization|school|institution/.test(q)) {
    title = "Building a measurable sustainability programme";
    issue = "An organisation needs a documented baseline and stable reporting boundaries before it can credibly claim environmental improvement.";
    actions = [
      "Define the sites, reporting period, operational boundary, units and responsible data owners.",
      "Collect actual utility bills, meter readings, fuel records, travel records and waste tickets before estimating emissions.",
      "Prioritise material sources and document calculation factors, source years and exclusions.",
      "Set time-bound targets and compare future measurements against the same baseline and method.",
    ];
  }

  return `**Local guidance mode — no external AI provider is connected.**

### ${title}

${issue}

### Recommended actions
${actions.map((a) => `- ${a}`).join("\n")}

### Estimated benefit
Hard to quantify without baseline measurements, local factors and a defined reporting period. ECOGENESIS should not claim savings until these inputs are available.

### Difficulty and cost
Start with measurement and behaviour changes; equipment upgrades and infrastructure work may require capital and a site-specific assessment.

### Sources and confidence
This is general curated guidance generated locally, not a live-data analysis or a cited scientific assessment. Confidence is moderate for the direction of the recommendations and low for any location-specific outcome. For measured environmental conditions, use the Intelligence Dashboard and inspect each provider's provenance.`;
}

/** GET /api/assistant — chat history for the session user. */
export async function GET() {
  try {
    const user = await getOrCreateUser();
    const msgs = await db.assistantMessage.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" }, take: 60 });
    return NextResponse.json({ messages: msgs.map((m) => ({ id: m.id, role: m.role, content: m.content, createdAt: m.createdAt })) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "load failed" }, { status: 500 });
  }
}

/** POST /api/assistant { message } — grounded sustainability advice. */
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "assistant-write", 10, 600000);
  if (limited) return limited;
  try {
    const user = await getOrCreateUser();
    const body = await req.json();
    const message = String(body.message || "").trim().slice(0, 2000);
    if (!message) return NextResponse.json({ error: "Please enter a question." }, { status: 400 });

    await db.assistantMessage.create({ data: { userId: user.id, role: "user", content: message } });

    // Personalise with the user's latest footprint (if any) — context only.
    const latest = await db.footprintResult.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
    let context = "";
    if (latest) {
      const resolved = resolveFootprintRecord(latest);
      const cats = resolved.categories;
      context =
        `\n\nUSER CONTEXT (self-reported estimate, not a measurement): latest footprint ≈ ${(resolved.totalKgCo2e / 1000).toFixed(2)} tCO2e/person/year. By category: ${cats.map((c) => `${c.label} ${(c.kgCo2e / 1000).toFixed(2)}t`).join(", ")}. ` +
        "Use this only to personalise priorities; remind the user it is an estimate from the platform calculator.";
    }

    const history = await db.assistantMessage.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 16 });
    const msgs = [...history].reverse().map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    let reply = "";
    let responseMode: "connected-ai" | "local-guidance" = "connected-ai";
    try {
      const { default: ZAI } = await import("z-ai-web-dev-sdk");
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          { role: "assistant", content: SYSTEM_PROMPT + context },
          ...msgs,
        ],
        thinking: { type: "disabled" },
      });
      reply = completion.choices[0]?.message?.content?.trim() ?? "";
      if (!reply) throw new Error("The connected AI provider returned an empty response.");
    } catch (providerError) {
      console.warn("ECOGENESIS AI provider unavailable; using local guidance fallback:", providerError instanceof Error ? providerError.message : "unknown provider error");
      reply = localGuidanceFallback(message);
      responseMode = "local-guidance";
    }

    const saved = await db.assistantMessage.create({ data: { userId: user.id, role: "assistant", content: reply } });
    return NextResponse.json({ reply: { id: saved.id, role: "assistant", content: reply, createdAt: saved.createdAt }, mode: responseMode });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "assistant failed" }, { status: 500 });
  }
}
