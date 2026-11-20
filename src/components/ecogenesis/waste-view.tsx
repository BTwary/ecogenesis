"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, Camera, History, Leaf, Recycle, Scale, Sparkles, Sprout, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard, DataBadge, StatTile, Donut, BarChart, IntegrityNote, EmptyState, SourcePanel } from "./ui-kit";
import { api, useAsync, fmtNum, timeAgo } from "@/lib/client";
import { toast } from "@/hooks/use-toast";

/* ---------------------------------- types --------------------------------- */

interface WasteLog {
  id: string;
  category: string;
  disposal: string;
  item: string;
  kg: number;
  createdAt: string;
}

interface WasteSummary {
  totalKg: number;
  byCategory: Record<string, number>;
  byDisposal: Record<string, number>;
  landfillKg: number;
  recycledKg: number;
  compostedKg: number;
  reusedKg: number;
  landfillDiversionPercent: number | null;
  avoidedKgCo2e: number;
  avoidanceMethod: string;
}

interface WasteResponse {
  logs: WasteLog[];
  summary: WasteSummary;
}

interface Classification {
  item: string;
  material: string;
  category: string;
  guidance: string;
  recyclabilityNote: string;
  confidence: string;
}

interface ClassifyResponse {
  classification: Classification;
  disclaimer: string;
}

/* -------------------------------- constants ------------------------------- */

const WASTE_CATEGORIES = ["plastic", "paper", "organic", "glass", "metal", "ewaste", "hazardous", "textile", "other"] as const;
type WasteCategory = (typeof WASTE_CATEGORIES)[number];

const WASTE_DISPOSALS = ["recycled", "landfill", "compost", "reused", "hazardous-facility", "unknown"] as const;
type WasteDisposal = (typeof WASTE_DISPOSALS)[number];

const CATEGORY_GUIDE: { key: WasteCategory; label: string; guide: string }[] = [
  {
    key: "plastic",
    label: "Plastic",
    guide:
      "Rinse containers. Check the resin code (1-7) printed on the item; acceptance varies by municipality. Flexible plastics (bags, film) are rarely accepted in kerbside bins — many supermarkets accept them separately.",
  },
  {
    key: "paper",
    label: "Paper",
    guide:
      "Keep dry and clean. Flatten cardboard. Greasy paper (pizza boxes, used tissues) belongs in organic or landfill depending on local rules.",
  },
  {
    key: "organic",
    label: "Organic",
    guide:
      "Food scraps and garden waste. Best option: home composting or a community composting hub — composting avoids the methane that landfilling produces.",
  },
  {
    key: "glass",
    label: "Glass",
    guide:
      "Rinse and remove lids. Sort by colour if your locality requires it. Broken glass: wrap securely and follow local instructions.",
  },
  {
    key: "metal",
    label: "Metal",
    guide:
      "Rinse cans and tins; metals are widely recycled. Aluminium foil: clean and ball it up; small scraps may not be recoverable.",
  },
  {
    key: "ewaste",
    label: "E-waste",
    guide:
      "Never in general waste. Use manufacturer take-back, authorised e-waste recyclers, or municipal collection days. Batteries: dedicated collection points.",
  },
  {
    key: "hazardous",
    label: "Hazardous",
    guide:
      "Paints, solvents, pesticides, expired medicines, batteries — follow municipal hazardous-waste collection. Never pour into drains or soil.",
  },
  {
    key: "textile",
    label: "Textile",
    guide:
      "Donate wearable clothing; damaged textiles may have separate collection. Fast fashion has a large footprint — repair and reuse first.",
  },
  {
    key: "other",
    label: "Other",
    guide:
      "When unsure, check your municipal solid-waste rules. Composite materials (e.g. juice cartons) often need special handling.",
  },
];

const COMPOST_STEPS = [
  "Choose a shaded spot with good drainage, close enough to the kitchen to be convenient.",
  "Layer browns (dry leaves, shredded cardboard) and greens (kitchen scraps) roughly 2:1 by volume.",
  "Keep the pile moist like a wrung-out sponge — damp, not dripping.",
  "Turn the pile every 1-2 weeks to keep it aerated and odour-free.",
  "It is ready in 2-4 months, when it looks dark and crumbly and smells earthy.",
];

function confidenceBadge(confidence: string) {
  if (confidence === "high") return <DataBadge kind="verified" label="HIGH CONFIDENCE" />;
  if (confidence === "low") return <DataBadge kind="stale" label="LOW CONFIDENCE" />;
  return <DataBadge kind="estimate" label="MEDIUM CONFIDENCE" />;
}

/* --------------------------------- component ------------------------------- */

export default function WasteView() {
  const waste = useAsync<WasteResponse>(() => api("/api/waste"), []);

  const [form, setForm] = useState<{ item: string; category: WasteCategory; disposal: WasteDisposal; kg: string }>({
    item: "",
    category: "plastic",
    disposal: "recycled",
    kg: "",
  });
  const [busy, setBusy] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const logFormRef = useRef<HTMLDivElement | null>(null);

  const [photo, setPhoto] = useState<string | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [classification, setClassification] = useState<Classification | null>(null);
  const [disclaimer, setDisclaimer] = useState<string | null>(null);

  useEffect(() => {
    if (waste.error) {
      toast({ title: "Could not load waste data", description: waste.error, variant: "destructive" });
    }
  }, [waste.error]);

  const summary = waste.data?.summary ?? null;
  const disposalSegments = summary
    ? Object.entries(summary.byDisposal).map(([label, value]) => ({ label, value }))
    : [];
  const categoryBars = summary
    ? Object.entries(summary.byCategory).map(([label, value]) => ({ label, value }))
    : [];

  function handlePhoto(file: File | null) {
    setClassification(null);
    setDisclaimer(null);
    setPhoto(null);
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Please choose an image under 4 MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function analysePhoto() {
    if (!photo || analysing) return;
    setAnalysing(true);
    try {
      const res = await api<ClassifyResponse>("/api/waste/classify", {
        method: "POST",
        body: JSON.stringify({ image: photo }),
      });
      setClassification(res.classification);
      setDisclaimer(res.disclaimer);
    } catch (e) {
      toast({ title: "Could not analyse image", description: e instanceof Error ? e.message : "Try again", variant: "destructive" });
    } finally {
      setAnalysing(false);
    }
  }

  function prefillFromClassification() {
    if (!classification) return;
    const cat = (WASTE_CATEGORIES as readonly string[]).includes(classification.category)
      ? (classification.category as WasteCategory)
      : "other";
    setForm({ item: classification.item, category: cat, disposal: "unknown", kg: "0.1" });
    setPrefilled(true);
    logFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function submitLog(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const kg = Number(form.kg);
    if (!Number.isFinite(kg) || kg <= 0) {
      toast({ title: "Invalid weight", description: "Enter a weight greater than 0 kg.", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      await api("/api/waste", {
        method: "POST",
        body: JSON.stringify({ category: form.category, disposal: form.disposal, item: form.item.trim(), kg }),
      });
      toast({ title: "Item logged", description: `${form.item || "Item"} — ${kg} kg as ${form.disposal}.` });
      setForm({ item: "", category: form.category, disposal: form.disposal, kg: "" });
      setPrefilled(false);
      waste.refetch();
    } catch (err) {
      toast({ title: "Could not log item", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6">
      {/* ------------------------------- header ------------------------------ */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          <Recycle className="h-4 w-4" /> Waste &amp; circularity
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Waste Tracker</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Log what you discard and where it goes, identify items with the AI photo assistant, and see how much
          landfill you divert. Every derived number is deterministic arithmetic on your own entries.
        </p>
        <IntegrityNote>
          Recyclability always depends on LOCAL municipal rules and item condition. This platform never claims an
          item is recyclable without that caveat.
        </IntegrityNote>
      </div>

      {waste.error && !waste.loading && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {waste.error}
        </div>
      )}

      {/* --------------------------- summary tiles --------------------------- */}
      {waste.loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
      ) : (
        summary && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label="Total logged"
              value={fmtNum(summary.totalKg, 1)}
              unit="kg"
              icon={<Scale className="h-4 w-4" />}
              badge={<DataBadge kind="self-reported" />}
              sub="Sum of every item you have logged."
            />
            <StatTile
              label="Landfill diversion"
              value={summary.landfillDiversionPercent === null ? "—" : `${summary.landfillDiversionPercent.toFixed(0)}%`}
              icon={<Recycle className="h-4 w-4" />}
              badge={<DataBadge kind="estimate" />}
              sub={
                summary.landfillDiversionPercent === null
                  ? "Log disposals to compute diversion."
                  : "Share kept out of landfill (recycled, composted or reused)."
              }
            />
            <StatTile
              label="Landfilled"
              value={fmtNum(summary.landfillKg, 1)}
              unit="kg"
              icon={<Trash2 className="h-4 w-4" />}
              badge={<DataBadge kind="self-reported" />}
              sub="Items you logged as sent to landfill."
            />
            <StatTile
              label="Avoided emissions"
              value={fmtNum(summary.avoidedKgCo2e, 1)}
              unit="kgCO2e"
              icon={<Leaf className="h-4 w-4" />}
              badge={<DataBadge kind="estimate" />}
              sub={summary.avoidanceMethod}
            />
          </div>
        )
      )}

      {summary && (
        <SourcePanel
          provenance={{
            providerName: "ECOGENESIS waste ledger",
            datasetId: "waste-logs",
            licence: "Your logged data + published emission factors",
            notes: summary.avoidanceMethod,
            retrievedAt: new Date().toISOString(),
          }}
        />
      )}

      {/* ------------------------------ charts ------------------------------- */}
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="space-y-3">
          <h3 className="text-sm font-semibold">By disposal route</h3>
          {waste.loading ? (
            <Skeleton className="h-44 w-full rounded-xl" />
          ) : disposalSegments.length > 0 && summary ? (
            <Donut segments={disposalSegments} centerValue={String(Math.round(summary.totalKg))} centerLabel="kg logged" />
          ) : (
            <EmptyState title="No disposals logged yet" hint="Log your first item below to see the split." />
          )}
        </GlassCard>
        <GlassCard className="space-y-3">
          <h3 className="text-sm font-semibold">By category</h3>
          {waste.loading ? (
            <Skeleton className="h-44 w-full rounded-xl" />
          ) : categoryBars.length > 0 ? (
            <BarChart data={categoryBars} />
          ) : (
            <EmptyState title="No categories yet" hint="Categories appear as soon as you log items." />
          )}
        </GlassCard>
      </div>

      {/* --------------------- log form + AI identification ------------------- */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div ref={logFormRef}>
          <GlassCard className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Trash2 className="h-4 w-4 text-accent" /> Log a waste item
            </h3>
            {prefilled && (
              <p className="rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-accent">
                Prefilled from the AI photo identification — review and adjust before logging.
              </p>
            )}
            <form className="space-y-4" onSubmit={submitLog}>
              <div className="space-y-1.5">
                <Label htmlFor="w-item">Item name</Label>
                <Input
                  id="w-item"
                  value={form.item}
                  maxLength={200}
                  placeholder="e.g. PET bottle, old t-shirt"
                  onChange={(e) => setForm((p) => ({ ...p, item: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v as WasteCategory }))}>
                    <SelectTrigger aria-label="Waste category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WASTE_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c} className="capitalize">
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Disposal</Label>
                  <Select value={form.disposal} onValueChange={(v) => setForm((p) => ({ ...p, disposal: v as WasteDisposal }))}>
                    <SelectTrigger aria-label="Disposal method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WASTE_DISPOSALS.map((d) => (
                        <SelectItem key={d} value={d} className="capitalize">
                          {d.replace("-", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="w-kg">Weight (kg)</Label>
                <Input
                  id="w-kg"
                  type="number"
                  min={0}
                  step="any"
                  value={form.kg}
                  placeholder="0"
                  className="font-mono"
                  onChange={(e) => setForm((p) => ({ ...p, kg: e.target.value }))}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/85"
                disabled={busy}
              >
                {busy ? "Logging..." : "Log item"}
              </Button>
            </form>
          </GlassCard>
        </div>

        <GlassCard className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Camera className="h-4 w-4 text-accent" /> AI photo identification
          </h3>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Choose a clear photo of a single item. The AI suggests what it is and how to dispose of it — always
            confirm against your local municipal rules.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="w-photo">Item photo</Label>
            <Input
              id="w-photo"
              type="file"
              accept="image/*"
              className="cursor-pointer"
              onChange={(e) => handlePhoto(e.target.files?.[0] ?? null)}
            />
            <p className="text-[11px] text-muted-foreground/80">PNG, JPEG or WebP, under 4 MB.</p>
          </div>
          {photo && (
            <img
              src={photo}
              alt="Preview of the item selected for AI identification"
              className="max-h-48 w-auto rounded-xl border border-border/60 object-contain"
            />
          )}
          <Button
            onClick={() => void analysePhoto()}
            disabled={!photo || analysing}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/85"
          >
            {analysing ? "Analysing..." : "Analyse with AI"}
          </Button>
          {classification && (
            <div className="space-y-3 rounded-xl border border-border/60 bg-background/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold leading-snug">{classification.item}</p>
                {confidenceBadge(classification.confidence)}
              </div>
              <p className="text-xs text-muted-foreground">Main material: {classification.material}</p>
              <p className="text-sm leading-relaxed text-foreground/90">{classification.guidance}</p>
              <p className="text-xs italic leading-relaxed text-muted-foreground">{classification.recyclabilityNote}</p>
              {disclaimer && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs leading-relaxed text-destructive">
                  {disclaimer}
                </p>
              )}
              <Button variant="outline" className="border-primary/40" onClick={prefillFromClassification}>
                <Sparkles className="mr-2 h-4 w-4" /> Log this item
              </Button>
            </div>
          )}
        </GlassCard>
      </div>

      {/* ------------------------ guide + composting ------------------------- */}
      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="space-y-2 lg:col-span-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <BookOpen className="h-4 w-4 text-primary" /> Classification guide
          </h3>
          <Accordion type="single" collapsible>
            {CATEGORY_GUIDE.map((c) => (
              <AccordionItem key={c.key} value={c.key}>
                <AccordionTrigger className="text-sm">{c.label}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{c.guide}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </GlassCard>
        <GlassCard className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Sprout className="h-4 w-4 text-primary" /> Start composting in 5 steps
          </h3>
          <p className="text-[11px] text-muted-foreground">General guidance — adapt to your climate and space.</p>
          <ol className="space-y-2.5">
            {COMPOST_STEPS.map((s, i) => (
              <li key={i} className="flex gap-3 text-xs leading-relaxed">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 font-mono text-[11px] font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{s}</span>
              </li>
            ))}
          </ol>
        </GlassCard>
      </div>

      {/* ---------------------------- recent logs ---------------------------- */}
      <GlassCard className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <History className="h-4 w-4 text-primary" /> Recent logs
        </h3>
        {waste.loading ? (
          <Skeleton className="h-24 w-full rounded-xl" />
        ) : (waste.data?.logs.length ?? 0) === 0 ? (
          <p className="text-xs text-muted-foreground">Nothing logged yet — your entries will appear here.</p>
        ) : (
          <div className="scroll-slim max-h-80 space-y-2 overflow-y-auto pr-1">
            {(waste.data?.logs ?? []).map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/40 px-3 py-2 text-xs"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground/90">{l.item}</p>
                  <p className="text-muted-foreground">
                    {l.category} · {timeAgo(l.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {l.disposal.replace("-", " ")}
                  </Badge>
                  <span className="font-mono">{fmtNum(l.kg, 1)} kg</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
