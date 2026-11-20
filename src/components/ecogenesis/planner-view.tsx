"use client";

import { useState } from "react";
import { Target, Plus, CheckCircle2, Flame, CalendarPlus, CircleCheck, Ban, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard, DataBadge, SectionHeading, EmptyState, GaugeRing } from "./ui-kit";
import { api, useAsync, fmtDate } from "@/lib/client";
import { toast } from "@/hooks/use-toast";

interface GoalProgress {
  id: string;
  date: string;
  value: number;
  note: string | null;
}

interface Goal {
  id: string;
  title: string;
  category: string;
  target: number | null;
  unit: string | null;
  period: string;
  startDate: string;
  endDate: string | null;
  status: string;
  createdAt: string;
  progressSum: number;
  progressPercent: number | null;
  progress: GoalProgress[];
}

const TEMPLATES = [
  { title: "Reduce electricity consumption by 10%", category: "energy", target: 10, unit: "% saved" },
  { title: "Avoid single-use plastic", category: "waste", target: 30, unit: "days" },
  { title: "Plant and maintain native plants", category: "nature", target: 5, unit: "plants" },
  { title: "Reduce food waste", category: "food", target: 4, unit: "weeks logged" },
  { title: "Use public transport more frequently", category: "transport", target: 12, unit: "trips" },
  { title: "Reduce household water consumption", category: "water", target: 30, unit: "days tracked" },
];

const CATEGORY_COLORS: Record<string, string> = {
  energy: "#34d399",
  water: "#38bdf8",
  waste: "#fbbf24",
  transport: "#a3e635",
  food: "#4ade80",
  nature: "#c084fc",
  general: "#94a3b8",
};

export default function PlannerView() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loggingFor, setLoggingFor] = useState<string | null>(null);
  const [logValue, setLogValue] = useState("1");
  const [logNote, setLogNote] = useState("");
  const goals = useAsync<{ goals: Goal[] }>(() => api("/api/goals"), [loggingFor, open]);

  async function createGoal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    try {
      await api("/api/goals", {
        method: "POST",
        body: JSON.stringify({
          title: fd.get("title"),
          category: fd.get("category"),
          target: fd.get("target") ? Number(fd.get("target")) : null,
          unit: fd.get("unit") || null,
          period: fd.get("period"),
          durationDays: fd.get("durationDays") ? Number(fd.get("durationDays")) : 30,
        }),
      });
      setOpen(false);
      goals.refetch();
      toast({ title: "Goal created", description: "Log progress to earn verified recognition." });
    } catch (err) {
      toast({ title: "Could not create goal", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  async function logProgress(goalId: string) {
    try {
      await api("/api/goals/progress", {
        method: "POST",
        body: JSON.stringify({ goalId, value: Number(logValue), note: logNote || undefined }),
      });
      setLoggingFor(null);
      setLogNote("");
      setLogValue("1");
      goals.refetch();
      toast({ title: "Progress logged" });
    } catch (e) {
      toast({ title: "Could not log progress", description: e instanceof Error ? e.message : "Try again", variant: "destructive" });
    }
  }

  async function setStatus(goalId: string, status: string) {
    await api("/api/goals/status", { method: "POST", body: JSON.stringify({ goalId, status }) });
    goals.refetch();
  }

  const active = (goals.data?.goals ?? []).filter((g) => g.status === "active");
  const completed = (goals.data?.goals ?? []).filter((g) => g.status === "completed");
  const cancelled = (goals.data?.goals ?? []).filter((g) => g.status === "cancelled");

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <SectionHeading
          eyebrow="Sustainable living planner"
          title="Goals, challenges & verified progress"
          description="Set measurable goals, run weekly or monthly challenges, and track every completed activity. Recognition is earned by logged activity — never by clicking buttons."
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/85">
              <Plus className="mr-2 h-4 w-4" /> New goal
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create a sustainability goal</DialogTitle>
              <DialogDescription>Make it measurable — a number you can honestly log against.</DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={createGoal}>
              <div className="space-y-1.5">
                <Label htmlFor="g-title">Goal</Label>
                <Input id="g-title" name="title" required placeholder="e.g. Bike to work twice a week" maxLength={140} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select name="category" defaultValue="general">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="energy">Energy</SelectItem>
                      <SelectItem value="water">Water</SelectItem>
                      <SelectItem value="waste">Waste</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="nature">Nature</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Challenge period</Label>
                  <Select name="period" defaultValue="month">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Weekly</SelectItem>
                      <SelectItem value="month">Monthly</SelectItem>
                      <SelectItem value="custom">Custom duration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="g-target">Target (optional)</Label>
                  <Input id="g-target" name="target" type="number" min={0} step="any" placeholder="e.g. 30" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="g-unit">Unit (optional)</Label>
                  <Input id="g-unit" name="unit" placeholder="e.g. days, kg, trips" maxLength={30} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="g-duration">Duration (custom period)</Label>
                <Input id="g-duration" name="durationDays" type="number" min={1} max={365} defaultValue={30} placeholder="days" />
              </div>
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/85" disabled={busy}>
                {busy ? "Creating..." : "Create goal"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates */}
      <GlassCard className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-accent" /> One-tap challenge templates</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.title}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/40 px-3 py-2.5 text-left text-xs transition-colors hover:border-accent/40 hover:bg-accent/[0.06]"
              onClick={async () => {
                try {
                  await api("/api/goals", { method: "POST", body: JSON.stringify({ title: t.title, category: t.category, target: t.target, unit: t.unit, period: "month" }) });
                  goals.refetch();
                  toast({ title: "Challenge added", description: t.title });
                } catch (e) {
                  toast({ title: "Could not add", description: e instanceof Error ? e.message : "Try again", variant: "destructive" });
                }
              }}
            >
              <span className="leading-relaxed">{t.title}</span>
              <CalendarPlus className="h-4 w-4 shrink-0 text-primary" />
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Active goals */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold"><Flame className="h-5 w-5 text-accent" /> Active ({active.length})</h3>
        {goals.loading && <Skeleton className="h-40 w-full rounded-2xl" />}
        {!goals.loading && active.length === 0 && (
          <EmptyState icon={<Target className="h-10 w-10" />} title="No active goals yet" hint="Create one from scratch or add a challenge template above." />
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {active.map((g) => (
            <GlassCard key={g.id} className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium leading-snug">{g.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {g.category} · started {fmtDate(g.startDate, false)}
                    {g.endDate ? ` · ends ${fmtDate(g.endDate, false)}` : ` · ${g.period}ly`}
                  </p>
                </div>
                <DataBadge kind="estimate" label={g.category.toUpperCase()} className="shrink-0" />
              </div>
              {g.target != null && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {fmtDate(g.progress[0]?.date ?? null, false) === "—" ? "No progress yet" : `${g.progressSum} of ${g.target} ${g.unit ?? ""}`}
                    </span>
                    <span className="font-mono text-accent">{g.progressPercent != null ? `${Math.round(g.progressPercent)}%` : ""}</span>
                  </div>
                  <Progress value={g.progressPercent ?? 0} className="h-2" />
                </div>
              )}
              {g.progress.length > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  Latest: {g.progress[g.progress.length - 1].value} {g.unit ?? ""}
                  {g.progress[g.progress.length - 1].note ? ` — ${g.progress[g.progress.length - 1].note}` : ""} · {fmtDate(g.progress[g.progress.length - 1].date)}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {loggingFor === g.id ? (
                  <div className="flex w-full flex-col gap-2 sm:flex-row">
                    <Input value={logValue} onChange={(e) => setLogValue(e.target.value)} type="number" min={0.01} step="any" className="w-24 font-mono" aria-label="Progress amount" />
                    <Input value={logNote} onChange={(e) => setLogNote(e.target.value)} placeholder="Note (optional)" className="flex-1" aria-label="Progress note" />
                    <Button size="sm" onClick={() => void logProgress(g.id)}>Log</Button>
                    <Button size="sm" variant="ghost" onClick={() => setLoggingFor(null)}>Cancel</Button>
                  </div>
                ) : (
                  <>
                    <Button size="sm" variant="outline" className="border-primary/40" onClick={() => { setLoggingFor(g.id); setLogValue(g.unit === "days" || g.unit === "weeks logged" ? "1" : "1"); }}>
                      <CircleCheck className="mr-1.5 h-3.5 w-3.5" /> Log progress
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => void setStatus(g.id, "completed")}>
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-primary" /> Mark complete
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => void setStatus(g.id, "cancelled")}>
                      <Ban className="mr-1.5 h-3.5 w-3.5" /> Cancel
                    </Button>
                  </>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Completed */}
      {completed.length > 0 && (
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold"><CheckCircle2 className="h-5 w-5 text-primary" /> Completed ({completed.length})</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completed.map((g) => (
              <GlassCard key={g.id} className="flex items-center gap-4">
                <GaugeRing value={100} size={72} color="#34d399" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{g.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {g.progressSum} {g.unit ?? "units"} logged · {g.progress.length} entries
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
      {cancelled.length > 0 && (
        <p className="text-xs text-muted-foreground">{cancelled.length} cancelled goal(s) are hidden from tracking but kept in your history.</p>
      )}
    </div>
  );
}
