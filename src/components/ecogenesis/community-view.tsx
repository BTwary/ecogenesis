"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ChevronDown,
  Handshake,
  Info,
  MessageSquare,
  Plus,
  Search,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GlassCard, DataBadge, StatTile, IntegrityNote, EmptyState } from "./ui-kit";
import { api, useAsync, fmtNum, timeAgo } from "@/lib/client";
import { toast } from "@/hooks/use-toast";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  lat: number;
  lng: number;
  placeName: string;
  orgName: string | null;
  impactClaim: string | null;
  verification: string;
  isDemo: boolean;
  sourceNote: string | null;
  createdAt: string;
  participantCount: number;
  joined: boolean;
  commentCount: number;
}

interface ProjectsResponse {
  projects: Project[];
}

interface Comment {
  id: string;
  body: string;
  author: string;
  createdAt: string;
}

interface CommentsResponse {
  comments: Comment[];
}

interface CommentState {
  items: Comment[];
  loading: boolean;
}

/* ------------------------------------------------------------------ */
/* Constants + helpers                                                 */
/* ------------------------------------------------------------------ */

const CATEGORIES: { value: string; label: string }[] = [
  { value: "restoration", label: "Restoration" },
  { value: "tree-planting", label: "Tree planting" },
  { value: "recycling", label: "Recycling" },
  { value: "renewable", label: "Renewable" },
  { value: "cleanup", label: "Clean-up" },
  { value: "biodiversity", label: "Biodiversity" },
  { value: "water", label: "Water" },
  { value: "education", label: "Education" },
];

const STATUSES: { value: string; label: string }[] = [
  { value: "planned", label: "Planned" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

function catLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

function statusLabel(value: string): string {
  return STATUSES.find((s) => s.value === value)?.label ?? value;
}

/* ------------------------------------------------------------------ */
/* View                                                                */
/* ------------------------------------------------------------------ */

export default function CommunityView() {
  /* Filters */
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [params, setParams] = useState("");

  const projects = useAsync<ProjectsResponse>(() => api(`/api/projects${params}`), [params]);

  /* Debounced filter → query-string param state (used as useAsync dep) */
  useEffect(() => {
    const sp = new URLSearchParams();
    if (category !== "all") sp.set("category", category);
    if (status !== "all") sp.set("status", status);
    if (q.trim()) sp.set("q", q.trim());
    const s = sp.toString();
    const t = setTimeout(() => setParams(s ? `?${s}` : ""), 300);
    return () => clearTimeout(t);
  }, [category, status, q]);

  /* Dialog + interaction state */
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [commentState, setCommentState] = useState<Record<string, CommentState>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [postingId, setPostingId] = useState<string | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const list = projects.data?.projects ?? [];
  const activeCount = list.filter((p) => p.status === "active").length;
  const participantTotal = list.reduce((sum, p) => sum + p.participantCount, 0);

  async function createInitiative(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    try {
      await api("/api/projects", {
        method: "POST",
        body: JSON.stringify({
          title: fd.get("title"),
          description: fd.get("description"),
          category: fd.get("category"),
          status: fd.get("status"),
          placeName: fd.get("placeName"),
          lat: Number(fd.get("lat")),
          lng: Number(fd.get("lng")),
          orgName: fd.get("orgName") || undefined,
          impactClaim: fd.get("impactClaim") || undefined,
        }),
      });
      setOpen(false);
      projects.refetch();
      toast({ title: "Initiative created", description: "Verification: self-reported until evidence is reviewed" });
    } catch (err) {
      toast({ title: "Could not create initiative", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  async function toggleJoin(p: Project) {
    setJoiningId(p.id);
    try {
      await api("/api/projects/join", {
        method: "POST",
        body: JSON.stringify({ projectId: p.id, action: p.joined ? "leave" : "join" }),
      });
      projects.refetch();
      toast({ title: p.joined ? "Left project" : "Joined project", description: p.title });
    } catch (err) {
      toast({ title: "Action failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    } finally {
      setJoiningId(null);
    }
  }

  async function toggleDetails(p: Project) {
    if (expanded === p.id) {
      setExpanded(null);
      return;
    }
    setExpanded(p.id);
    if (!commentState[p.id]) {
      setCommentState((cur) => ({ ...cur, [p.id]: { items: [], loading: true } }));
      try {
        const res = await api<CommentsResponse>(`/api/projects/comments?projectId=${encodeURIComponent(p.id)}`);
        setCommentState((cur) => ({ ...cur, [p.id]: { items: res.comments, loading: false } }));
      } catch (err) {
        setCommentState((cur) => ({ ...cur, [p.id]: { items: [], loading: false } }));
        toast({ title: "Could not load comments", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
      }
    }
  }

  async function postComment(p: Project) {
    const body = (drafts[p.id] ?? "").trim();
    if (!body) {
      toast({ title: "Comment cannot be empty", variant: "destructive" });
      return;
    }
    setPostingId(p.id);
    try {
      const res = await api<{ comment: Comment }>("/api/projects/comments", {
        method: "POST",
        body: JSON.stringify({ projectId: p.id, body }),
      });
      setCommentState((cur) => ({
        ...cur,
        [p.id]: { items: [...(cur[p.id]?.items ?? []), res.comment], loading: false },
      }));
      setDrafts((cur) => ({ ...cur, [p.id]: "" }));
      toast({ title: "Comment posted" });
    } catch (err) {
      toast({ title: "Could not post comment", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    } finally {
      setPostingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6">
      {/* ------------------------------ HEADER ------------------------------ */}
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          <Handshake className="h-4 w-4" />
          Community network
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Launch, join and honestly report</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Community initiatives with participation tracking, threaded comments and transparent impact claims.
          Demonstration entries are clearly labelled; real entries start as self-reported.
        </p>
        <IntegrityNote>
          Impact claims are self-reported until evidence is reviewed and verified — estimated claims and verified
          outcomes are never presented as the same thing. Demonstration entries are clearly labelled and are not real
          projects.
        </IntegrityNote>
      </header>

      {/* --------------------------- STATS STRIP --------------------------- */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Tracked projects"
          value={fmtNum(list.length, 0)}
          icon={<Handshake className="h-4 w-4" />}
          sub="Includes clearly-marked demonstration entries used to illustrate the platform."
        />
        <StatTile
          label="Active projects"
          value={fmtNum(activeCount, 0)}
          icon={<Activity className="h-4 w-4" />}
          sub="Status is shown as reported; active status is never claimed without participant evidence."
        />
        <StatTile
          label="Total participants"
          value={fmtNum(participantTotal, 0)}
          icon={<Users className="h-4 w-4" />}
          sub="Sum of participation records across tracked projects."
        />
      </div>

      {/* --------------------------- FILTERS + LAUNCH --------------------------- */}
      <GlassCard className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-col gap-3 md:flex-row md:items-center lg:flex-1">
          <div className="w-full md:w-52">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger aria-label="Filter by category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-44">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger aria-label="Filter by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative w-full md:max-w-sm md:flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title, description or place"
              className="pl-8"
              aria-label="Search initiatives"
              maxLength={120}
            />
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0 bg-accent text-accent-foreground hover:bg-accent/85">
              <Plus className="mr-2 h-4 w-4" /> Launch an initiative
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Launch an initiative</DialogTitle>
              <DialogDescription>
                Describe honestly what you are doing and where. New entries are self-reported until evidence is reviewed.
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={createInitiative}>
              <div className="space-y-1.5">
                <Label htmlFor="i-title">Title</Label>
                <Input id="i-title" name="title" required placeholder="e.g. Weekend lake clean-up crew" maxLength={140} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="i-desc">Description</Label>
                <Textarea id="i-desc" name="description" required rows={3} placeholder="What the project does, who it involves, how people can take part" maxLength={2000} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select name="category" defaultValue="restoration">
                    <SelectTrigger aria-label="Category"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select name="status" defaultValue="planned">
                    <SelectTrigger aria-label="Status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="i-place">Location name</Label>
                <Input id="i-place" name="placeName" required placeholder="e.g. Ulsoor Lake, Bengaluru" maxLength={120} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="i-lat">Latitude (-90 to 90)</Label>
                  <Input id="i-lat" name="lat" type="number" step="any" min={-90} max={90} required placeholder="e.g. 12.98" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="i-lng">Longitude (-180 to 180)</Label>
                  <Input id="i-lng" name="lng" type="number" step="any" min={-180} max={180} required placeholder="e.g. 77.59" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="i-org">Organisation (optional)</Label>
                <Input id="i-org" name="orgName" placeholder="e.g. Green Valley Residents Association" maxLength={120} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="i-impact">Impact claim (optional)</Label>
                <Textarea id="i-impact" name="impactClaim" rows={2} placeholder="What outcome do you expect? Be honest — this stays self-reported until reviewed" maxLength={500} />
              </div>
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/85" disabled={busy}>
                {busy ? "Creating..." : "Create initiative"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </GlassCard>

      {/* --------------------------- PROJECT CARDS --------------------------- */}
      <section className="space-y-4" aria-label="Initiatives">
        {projects.loading ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (<Skeleton key={i} className="h-56 w-full rounded-2xl" />))}
          </div>
        ) : projects.error ? (
          <EmptyState title="Could not load initiatives" hint={projects.error} />
        ) : list.length === 0 ? (
          <EmptyState
            icon={<Handshake className="h-10 w-10" />}
            title="No initiatives match these filters"
            hint="Adjust the filters above or launch the first initiative yourself."
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {list.map((p) => {
              const comments = commentState[p.id];
              return (
                <GlassCard key={p.id} className="flex flex-col gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {p.isDemo ? (
                        <DataBadge kind="demo" />
                      ) : p.verification === "verified" ? (
                        <DataBadge kind="verified" />
                      ) : (
                        <DataBadge kind="self-reported" />
                      )}
                      <span className="text-[11px] text-muted-foreground">
                        {catLabel(p.category)} · {statusLabel(p.status)}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold leading-snug">{p.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {p.placeName}
                      {p.orgName ? ` · ${p.orgName}` : ""}
                    </p>
                  </div>

                  {p.impactClaim && (
                    <div className="rounded-xl border border-chart-4/25 bg-chart-4/[0.06] p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-chart-4">
                        Impact claim{p.verification !== "verified" && !p.isDemo ? " (self-reported)" : ""}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-foreground/80">{p.impactClaim}</p>
                    </div>
                  )}

                  <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">{p.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.participantCount} participant{p.participantCount === 1 ? "" : "s"} · {p.commentCount} comment{p.commentCount === 1 ? "" : "s"}
                  </p>

                  <div className="mt-auto flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={p.joined ? "outline" : "default"}
                      className={p.joined ? "border-primary/40" : undefined}
                      onClick={() => void toggleJoin(p)}
                      disabled={joiningId === p.id}
                    >
                      {p.joined ? <UserMinus className="mr-1.5 h-3.5 w-3.5" /> : <UserPlus className="mr-1.5 h-3.5 w-3.5" />}
                      {joiningId === p.id ? "..." : p.joined ? "Leave" : "Join"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => void toggleDetails(p)} aria-expanded={expanded === p.id}>
                      <ChevronDown className={"mr-1.5 h-3.5 w-3.5 transition-transform " + (expanded === p.id ? "rotate-180" : "")} />
                      Details
                    </Button>
                  </div>

                  {expanded === p.id && (
                    <div className="space-y-3 border-t border-border/60 pt-3">
                      <p className="text-xs leading-relaxed text-foreground/80">{p.description}</p>
                      {p.isDemo && p.sourceNote && (
                        <p className="flex gap-1.5 rounded-xl border border-chart-4/25 bg-chart-4/[0.06] px-3 py-2 text-xs leading-relaxed text-chart-4">
                          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          {p.sourceNote}
                        </p>
                      )}
                      <div className="space-y-2">
                        <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <MessageSquare className="h-3.5 w-3.5" /> Comments
                        </h4>
                        {comments?.loading ? (
                          <Skeleton className="h-16 w-full rounded-xl" />
                        ) : (comments?.items.length ?? 0) === 0 ? (
                          <p className="text-xs text-muted-foreground">No comments yet.</p>
                        ) : (
                          <div className="scroll-slim max-h-48 space-y-2 overflow-y-auto pr-1">
                            {comments!.items.map((c) => (
                              <div key={c.id} className="rounded-xl border border-border/50 bg-background/30 px-3 py-2">
                                <p className="text-xs font-medium text-foreground/85">
                                  {c.author} <span className="font-normal text-muted-foreground">· {timeAgo(c.createdAt)}</span>
                                </p>
                                <p className="mt-1 text-xs leading-relaxed text-foreground/75">{c.body}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Textarea
                            value={drafts[p.id] ?? ""}
                            onChange={(e) => setDrafts((cur) => ({ ...cur, [p.id]: e.target.value }))}
                            rows={2}
                            placeholder="Add a comment..."
                            aria-label={`Add a comment to ${p.title}`}
                            maxLength={800}
                          />
                          <Button
                            size="sm"
                            className="sm:self-end"
                            onClick={() => void postComment(p)}
                            disabled={postingId === p.id}
                          >
                            {postingId === p.id ? "Posting..." : "Post"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </GlassCard>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
