import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { calculateFootprint, type FootprintInputs } from "@/lib/factors";
import { makeFactorSnapshot, resolveFootprintRecord } from "@/lib/footprint-record";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** GET /api/footprint — saved per-person allocated estimates (newest first). */
export async function GET(req: NextRequest) {
  const limited = rateLimit(req, "footprint-read", 60, 60_000);
  if (limited) return limited;
  try {
    const user = await getOrCreateUser();
    const results = await db.footprintResult.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 24,
    });
    return NextResponse.json({
      results: results.map((r) => ({
        ...resolveFootprintRecord(r),
        inputs: JSON.parse(r.inputs),
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "load failed" }, { status: 500 });
  }
}

/**
 * POST /api/footprint — calculate; persist ONLY when the explicit save flag is true.
 * Omitting save is non-persistent, preventing a quick estimate from silently
 * writing to history.
 */
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "footprint-write", 20, 60_000);
  if (limited) return limited;
  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "A JSON object of calculator inputs is required." }, { status: 400 });
    }
    const record = body as Record<string, unknown>;
    const save = record.save === true;
    const inputRecord = { ...record };
    delete inputRecord.save;

    const numericFields = [
      "carKmWeek", "twoWheelerKmWeek", "busKmWeek", "trainKmWeek", "shortFlightsYear", "longFlightsYear",
      "electricityKwhMonth", "customGridFactor", "lpgCylindersMonth", "pngKwhMonth", "clothingItemsYear",
      "phonesYear", "laptopsYear", "landfillKgWeek", "recycledKgWeek", "compostedKgWeek", "waterLitresDay",
      "householdSize",
    ];
    for (const field of numericFields) {
      const value = inputRecord[field];
      if (value !== undefined && (typeof value !== "number" || !Number.isFinite(value) || value < 0)) {
        return NextResponse.json({ error: `${field} must be a finite non-negative number.` }, { status: 400 });
      }
    }
    if (typeof inputRecord.householdSize === "number" && (!Number.isInteger(inputRecord.householdSize) || inputRecord.householdSize < 1 || inputRecord.householdSize > 12)) {
      return NextResponse.json({ error: "householdSize must be an integer from 1 to 12." }, { status: 400 });
    }
    if (typeof inputRecord.customGridFactor === "number" && inputRecord.customGridFactor > 2) {
      return NextResponse.json({ error: "customGridFactor must not exceed 2 kgCO2e/kWh." }, { status: 400 });
    }

    const allowed = {
      carType: ["petrol", "diesel", "ev", "none"],
      grid: ["india", "world", "custom"],
      diet: ["heavy_meat", "medium_meat", "low_meat", "vegetarian", "vegan"],
      foodWaste: ["low", "moderate", "high"],
    } as const;
    for (const [field, choices] of Object.entries(allowed)) {
      if (inputRecord[field] !== undefined && !choices.includes(String(inputRecord[field]) as never)) {
        return NextResponse.json({ error: `${field} has an unsupported value.` }, { status: 400 });
      }
    }
    for (const [field, value] of Object.entries(inputRecord)) {
      if (typeof value === "number" && value > 1_000_000 && field !== "householdSize") {
        return NextResponse.json({ error: `${field} exceeds the supported range.` }, { status: 400 });
      }
    }

    const inputs = inputRecord as Partial<FootprintInputs>;
    const result = calculateFootprint(inputs);
    if (!Number.isFinite(result.totalKg) || result.totalKg < 0 || result.categories.some((category) => !Number.isFinite(category.kgCo2e) || category.kgCo2e < 0)) {
      return NextResponse.json({ error: "Calculation produced an invalid result." }, { status: 400 });
    }

    if (!save) {
      return NextResponse.json({ id: null, saved: false, result });
    }

    const user = await getOrCreateUser();
    const saved = await db.footprintResult.create({
      data: {
        userId: user.id,
        inputs: JSON.stringify(inputs),
        totalKgCo2e: result.totalKg,
        categories: JSON.stringify(result.categories.map((category) => ({ key: category.key, label: category.label, kgCo2e: category.kgCo2e }))),
        factorsJson: makeFactorSnapshot(result.factorsUsed),
      },
    });
    return NextResponse.json({ id: saved.id, saved: true, result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "calculation failed" }, { status: 500 });
  }
}
