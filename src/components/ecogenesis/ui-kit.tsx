"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Database, ShieldAlert, Info } from "lucide-react";
import { timeAgo } from "@/lib/client";

/* ------------------------------------------------------------------ */
/* Glass surfaces                                                      */
/* ------------------------------------------------------------------ */

export function GlassCard({
  className,
  children,
  hover = false,
}: {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "glass rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.25)]",
        hover && "transition-all duration-300 hover:border-primary/40 hover:bg-primary/[0.06]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {eyebrow && (
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          <span className="neon-dot inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          {eyebrow}
        </div>
      )}
      <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
      {description && <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">{description}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Data-kind badges (integrity: live vs historical vs estimate vs demo) */
/* ------------------------------------------------------------------ */

export type DataKind = "live" | "historical" | "estimate" | "demo" | "cached" | "stale" | "verified" | "self-reported";

const BADGE_STYLES: Record<DataKind, string> = {
  live: "bg-accent/15 text-accent border-accent/30",
  historical: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  estimate: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  demo: "bg-chart-4/10 text-chart-4/90 border-chart-4/25",
  cached: "bg-secondary text-muted-foreground border-border",
  stale: "bg-destructive/15 text-destructive border-destructive/30",
  verified: "bg-primary/15 text-primary border-primary/30",
  "self-reported": "bg-secondary text-muted-foreground border-border",
};

export function DataBadge({ kind, label, className }: { kind: DataKind; label?: string; className?: string }) {
  const defaults: Record<DataKind, string> = {
    live: "MODEL NOWCAST",
    historical: "HISTORICAL",
    estimate: "ESTIMATE",
    demo: "DEMO DATA",
    cached: "CACHED",
    stale: "STALE",
    verified: "VERIFIED",
    "self-reported": "SELF-REPORTED",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wider",
        BADGE_STYLES[kind],
        className,
      )}
    >
      {kind === "live" && <span className="eco-pulse inline-block h-1.5 w-1.5 rounded-full bg-accent" />}
      {label ?? defaults[kind]}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Provenance / source panel                                           */
/* ------------------------------------------------------------------ */

export interface ProvenanceShape {
  providerName?: string;
  provider?: string;
  datasetId?: string;
  sourceUrl?: string;
  licence?: string;
  retrievedAt?: string | null;
  cached?: boolean;
  stale?: boolean;
  notes?: string;
  warning?: string;
}

export function SourcePanel({
  provenance,
  extra,
  compact = false,
}: {
  provenance?: ProvenanceShape | null;
  extra?: { label: string; value: string }[];
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  if (!provenance) return null;
  return (
    <div className="rounded-xl border border-border/60 bg-background/40">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:text-foreground"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-1.5">
          <Database className="h-3.5 w-3.5 text-primary" />
          <span className="font-medium text-foreground/80">{provenance.providerName ?? provenance.provider ?? "Data source"}</span>
          {provenance.cached && <DataBadge kind={provenance.stale ? "stale" : "cached"} />}
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="space-y-1.5 border-t border-border/60 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
          {extra?.map((e) => (
            <div key={e.label}>
              <span className="text-foreground/70">{e.label}:</span> {e.value}
            </div>
          ))}
          <div>
            <span className="text-foreground/70">Dataset:</span> {provenance.datasetId ?? "—"}
          </div>
          <div>
            <span className="text-foreground/70">Retrieved:</span> {provenance.retrievedAt ? timeAgo(provenance.retrievedAt) : "—"}
          </div>
          {provenance.sourceUrl && (
            <div className="truncate">
              <span className="text-foreground/70">Source:</span>{" "}
              <a href={provenance.sourceUrl} target="_blank" rel="noreferrer noopener" className="text-primary underline-offset-2 hover:underline">
                {provenance.sourceUrl}
              </a>
            </div>
          )}
          {provenance.licence && (
            <div>
              <span className="text-foreground/70">Licence:</span> {provenance.licence}
            </div>
          )}
          {provenance.notes && !compact && (
            <div className="flex gap-1.5 pt-1">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-chart-3" />
              <span>{provenance.notes}</span>
            </div>
          )}
          {provenance.warning && (
            <div className="flex gap-1.5 pt-1 text-destructive">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{provenance.warning}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stat tiles                                                          */
/* ------------------------------------------------------------------ */

export function StatTile({
  label,
  value,
  unit,
  sub,
  icon,
  badge,
  className,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}) {
  return (
    <GlassCard className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="flex items-center gap-2">
          {badge}
          {icon && <span className="text-primary">{icon}</span>}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-3xl font-semibold tracking-tight text-gradient-eco">{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
      {sub && <div className="text-xs leading-relaxed text-muted-foreground">{sub}</div>}
    </GlassCard>
  );
}

/* ------------------------------------------------------------------ */
/* SVG charts (dependency-free, dark-theme styled)                     */
/* ------------------------------------------------------------------ */

export const CHART_COLORS = ["#34d399", "#a3e635", "#38bdf8", "#fbbf24", "#94a3b8", "#c084fc"];

function niceCeil(v: number): number {
  if (v <= 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  return Math.ceil(v / mag) * mag;
}

export function LineChart({
  series,
  height = 180,
  yLabel,
  xLabels,
  area = true,
}: {
  series: { name: string; color: string; points: number[] }[];
  height?: number;
  yLabel?: string;
  xLabels?: string[];
  area?: boolean;
}) {
  const W = 600;
  const H = height;
  const padL = 44;
  const padR = 10;
  const padT = 12;
  const padB = 22;
  const n = Math.max(...series.map((s) => s.points.length), 1);
  const all = series.flatMap((s) => s.points).filter((v) => Number.isFinite(v));
  if (all.length === 0) {
    return <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">No data</div>;
  }
  const max = niceCeil(Math.max(...all) * 1.05);
  const min = 0;
  const x = (i: number) => padL + (i / Math.max(1, n - 1)) * (W - padL - padR);
  const y = (v: number) => padT + (1 - (v - min) / (max - min)) * (H - padT - padB);

  const gridY = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ v: min + f * (max - min), y: y(min + f * (max - min)) }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Line chart${yLabel ? ` of ${yLabel}` : ""}`}>
      {gridY.map((g, i) => (
        <g key={i}>
          <line x1={padL} x2={W - padR} y1={g.y} y2={g.y} stroke="currentColor" className="text-foreground/10" strokeWidth="1" />
          <text x={padL - 6} y={g.y + 3} textAnchor="end" className="fill-muted-foreground" fontSize="9">
            {g.v >= 1000 ? `${(g.v / 1000).toFixed(1)}k` : g.v >= 10 ? g.v.toFixed(0) : g.v.toFixed(1)}
          </text>
        </g>
      ))}
      {series.map((s, si) => {
        const pts = s.points.map((v, i) => `${x(i)},${y(v)}`).join(" ");
        return (
          <g key={si}>
            {area && (
              <polygon
                points={`${padL},${y(min)} ${pts} ${x(s.points.length - 1)},${y(min)}`}
                fill={s.color}
                opacity="0.08"
              />
            )}
            <polyline points={pts} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          </g>
        );
      })}
      {xLabels &&
        xLabels.map((l, i) =>
          l ? (
            <text key={i} x={x(i)} y={H - 6} textAnchor="middle" className="fill-muted-foreground" fontSize="9">
              {l}
            </text>
          ) : null,
        )}
      {yLabel && (
        <text x={padL - 34} y={padT + 4} className="fill-muted-foreground" fontSize="8">
          {yLabel.slice(0, 14)}
        </text>
      )}
    </svg>
  );
}

export function BarChart({
  data,
  height = 180,
  valueFormat = (v: number) => v.toFixed(0),
}: {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  valueFormat?: (v: number) => string;
}) {
  const W = 600;
  const H = height;
  const padL = 44;
  const padR = 8;
  const padT = 14;
  const padB = 26;
  if (data.length === 0) {
    return <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">No data</div>;
  }
  const max = niceCeil(Math.max(...data.map((d) => d.value)) * 1.05);
  const bw = (W - padL - padR) / data.length;
  const y = (v: number) => padT + (1 - v / max) * (H - padT - padB);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Bar chart">
      {[0, 0.5, 1].map((f, i) => (
        <g key={i}>
          <line x1={padL} x2={W - padR} y1={y(f * max)} y2={y(f * max)} stroke="currentColor" className="text-foreground/10" />
          <text x={padL - 6} y={y(f * max) + 3} textAnchor="end" className="fill-muted-foreground" fontSize="9">
            {valueFormat(f * max)}
          </text>
        </g>
      ))}
      {data.map((d, i) => (
        <g key={i}>
          <rect
            x={padL + i * bw + bw * 0.15}
            y={y(d.value)}
            width={bw * 0.7}
            height={Math.max(1, H - padB - y(d.value))}
            rx="3"
            fill={d.color ?? CHART_COLORS[i % CHART_COLORS.length]}
            opacity="0.9"
          />
          <text x={padL + i * bw + bw / 2} y={H - 8} textAnchor="middle" className="fill-muted-foreground" fontSize="9">
            {d.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function Donut({
  segments,
  size = 150,
  centerValue,
  centerLabel,
}: {
  segments: { label: string; value: number; color?: string }[];
  size?: number;
  centerValue?: string;
  centerLabel?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const R = size / 2 - 14;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Donut chart">
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="currentColor" className="text-foreground/10" strokeWidth="14" />
        {total > 0 &&
          segments.map((s, i) => {
            const frac = s.value / total;
            const dash = frac * C;
            const el = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={R}
                fill="none"
                stroke={s.color ?? CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth="14"
                strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                strokeLinecap="butt"
              />
            );
            offset += dash;
            return el;
          })}
        {centerValue && (
          <text x={size / 2} y={size / 2 - 2} textAnchor="middle" className="fill-foreground" fontSize="16" fontWeight="600">
            {centerValue}
          </text>
        )}
        {centerLabel && (
          <text x={size / 2} y={size / 2 + 14} textAnchor="middle" className="fill-muted-foreground" fontSize="9">
            {centerLabel}
          </text>
        )}
      </svg>
      <div className="min-w-0 flex-1 space-y-1.5">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: s.color ?? CHART_COLORS[i % CHART_COLORS.length] }} />
              <span className="truncate text-foreground/85">{s.label}</span>
            </span>
            <span className="font-mono text-muted-foreground">{total > 0 ? `${((s.value / total) * 100).toFixed(0)}%` : "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GaugeRing({
  value,
  max = 100,
  size = 120,
  color = "#34d399",
  label,
  sub,
}: {
  value: number;
  max?: number;
  size?: number;
  color?: string;
  label?: string;
  sub?: string;
}) {
  const R = size / 2 - 10;
  const C = 2 * Math.PI * R;
  const frac = Math.max(0, Math.min(1, max > 0 ? value / max : 0));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Progress ${Math.round(frac * 100)}%`}>
      <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="currentColor" className="text-foreground/10" strokeWidth="9" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={R}
        fill="none"
        stroke={color}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={`${frac * C} ${C}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2 + (label ? -2 : 5)} textAnchor="middle" className="fill-foreground" fontSize="18" fontWeight="600">
        {label ?? `${Math.round(frac * 100)}%`}
      </text>
      {sub && (
        <text x={size / 2} y={size / 2 + 16} textAnchor="middle" className="fill-muted-foreground" fontSize="9">
          {sub}
        </text>
      )}
    </svg>
  );
}

export function Sparkline({ points, color = "#34d399", width = 120, height = 34 }: { points: number[]; color?: string; width?: number; height?: number }) {
  if (points.length < 2) return null;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const d = points.map((v, i) => `${(i / (points.length - 1)) * width},${height - 4 - ((v - min) / range) * (height - 8)}`);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline points={d.join(" ")} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Misc                                                                */
/* ------------------------------------------------------------------ */

export function EmptyState({ icon, title, hint }: { icon?: React.ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/70 px-6 py-12 text-center">
      {icon && <div className="text-primary/70">{icon}</div>}
      <p className="text-sm font-medium text-foreground/85">{title}</p>
      {hint && <p className="max-w-sm text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function IntegrityNote({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex gap-2 rounded-xl border border-chart-3/25 bg-chart-3/[0.06] px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-chart-3" />
      <div>
        {children ??
          "Values on this page are estimates derived from documented, published factors and real provider data. They are not audited measurements. Open any data-source panel to trace provenance."}
      </div>
    </div>
  );
}
