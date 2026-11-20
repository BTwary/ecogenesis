"use client";

import { useState } from "react";
import { Bird, Camera, Crosshair, Info, MapPin, Send, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard, DataBadge, SourcePanel, StatTile, IntegrityNote, EmptyState } from "./ui-kit";
import { api, useAsync, fmtNum, fmtDate, timeAgo } from "@/lib/client";
import { toast } from "@/hooks/use-toast";
import { CITIES } from "./city-list";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface BioResponse {
  location: { lat: number; lng: number };
  radiusKm: number;
  totalCount: number;
  sampledRecords: number;
  speciesCounts: { species: string; count: number; kingdom: string }[];
  recent: { species: string; observedAt: string; lat: number; lng: number; basisOfRecord: string }[];
  analytics: { methodology: string; limitations: string[]; confidence: string };
  provenance: { providerName: string; retrievedAt: string };
}

interface ObservationsResponse {
  observations: {
    id: string;
    speciesGuess: string;
    kind: string;
    notes: string | null;
    photo: string | null;
    placeName: string | null;
    lat: number | null;
    lng: number | null;
    isOwn: boolean;
    observer: string;
    createdAt: string;
  }[];
}

const KINDS: { value: string; label: string }[] = [
  { value: "flora", label: "Flora" },
  { value: "fauna", label: "Fauna" },
  { value: "fungi", label: "Fungi" },
  { value: "habitat", label: "Habitat" },
];

const MAX_PHOTO_BYTES = 1.5 * 1024 * 1024;

const POLLINATOR_TIPS = [
  "Plant native flowering species chosen so that something is in bloom across the seasons — nectar and pollen stay available all year.",
  "Avoid pesticides in your garden or balcony. Even sprays labelled natural can harm pollinators, soil life and aquatic insects.",
  "Leave some deadwood, hollow stems and leaf litter in place. Many insects and fungi need them to complete their life cycles.",
  "Provide a shallow water source with stones or corks for safe landing, and refresh it regularly.",
];

/* ------------------------------------------------------------------ */
/* View                                                                */
/* ------------------------------------------------------------------ */

export default function BiodiversityView() {
  /* GBIF explorer state */
  const [cityId, setCityId] = useState("delhi");
  const [radius, setRadius] = useState("10");
  const [customLoc, setCustomLoc] = useState<{ lat: number; lng: number } | null>(null);
  const city = CITIES.find((c) => c.id === cityId)!;
  const point = customLoc ?? { lat: city.lat, lng: city.lng };
  const locLabel = customLoc ? "your location" : city.name;

  const bio = useAsync<BioResponse>(
    () => api(`/api/env/biodiversity?lat=${point.lat}&lng=${point.lng}&radiusKm=${radius}`),
    [point.lat, point.lng, radius],
  );

  const obs = useAsync<ObservationsResponse>(() => api("/api/observations"), []);

  /* Observation form state */
  const [species, setSpecies] = useState("");
  const [kind, setKind] = useState("flora");
  const [place, setPlace] = useState("");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [latText, setLatText] = useState("");
  const [lngText, setLngText] = useState("");
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      toast({ title: "Location unavailable — pick a city instead", variant: "destructive" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCustomLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        toast({ title: "Location captured", description: "Exploring GBIF records around your position." });
      },
      () => toast({ title: "Location unavailable — pick a city instead", variant: "destructive" }),
      { timeout: 10000, maximumAge: 60000 },
    );
  }

  function captureFormLocation() {
    if (!("geolocation" in navigator)) {
      toast({ title: "Location unavailable", description: "Enter latitude and longitude manually instead.", variant: "destructive" });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatText(pos.coords.latitude.toFixed(5));
        setLngText(pos.coords.longitude.toFixed(5));
        setLocating(false);
      },
      () => {
        setLocating(false);
        toast({ title: "Location unavailable", description: "Enter latitude and longitude manually instead.", variant: "destructive" });
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  }

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPhoto(null);
    if (!file) return;
    if (file.size > MAX_PHOTO_BYTES) {
      toast({ title: "Photo too large", description: "Please choose an image under 1.5 MB.", variant: "destructive" });
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function resetForm() {
    setSpecies("");
    setKind("flora");
    setPlace("");
    setNotes("");
    setPhoto(null);
    setLatText("");
    setLngText("");
  }

  async function submitObservation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!species.trim()) {
      toast({ title: "Species name required", description: "Enter what you observed, even if it is only a guess.", variant: "destructive" });
      return;
    }
    let lat: number | undefined;
    let lng: number | undefined;
    if (latText.trim() !== "" || lngText.trim() !== "") {
      lat = Number(latText);
      lng = Number(lngText);
      const valid =
        latText.trim() !== "" &&
        lngText.trim() !== "" &&
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        Math.abs(lat) <= 90 &&
        Math.abs(lng) <= 180;
      if (!valid) {
        toast({ title: "Check the coordinates", description: "Latitude must be -90 to 90 and longitude -180 to 180, or leave both empty.", variant: "destructive" });
        return;
      }
    }
    setBusy(true);
    try {
      await api("/api/observations", {
        method: "POST",
        body: JSON.stringify({
          speciesGuess: species.trim(),
          kind,
          notes: notes.trim() || undefined,
          placeName: place.trim() || undefined,
          lat,
          lng,
          photo: photo ?? undefined,
        }),
      });
      toast({ title: "Observation recorded — thank you", description: "It is now visible in the community feed." });
      resetForm();
      obs.refetch();
    } catch (err) {
      toast({ title: "Could not save observation", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  const observations = (obs.data?.observations ?? []).slice(0, 24);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6">
      {/* ------------------------------ HEADER ------------------------------ */}
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          <Bird className="h-4 w-4" />
          Biodiversity explorer
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Species around you — counted, not invented</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Explore real GBIF occurrence records for any area, then contribute your own field observations to the
          community atlas. Every snapshot names its provider, methodology and limitations.
        </p>
        <IntegrityNote>
          Species totals come from the GBIF occurrence snapshot for the requested radius and are only as complete as
          GBIF coverage in that area. Community observations are user-submitted best guesses, not confirmed
          identifications.
        </IntegrityNote>
      </header>

      {/* --------------------------- GBIF EXPLORER --------------------------- */}
      <GlassCard className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Bird className="h-5 w-5 text-primary" /> GBIF species explorer
          </h2>
          <DataBadge kind="live" label="GBIF SNAPSHOT" />
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="w-full md:w-52">
            <Select
              value={cityId}
              onValueChange={(v) => {
                setCityId(v);
                setCustomLoc(null);
              }}
            >
              <SelectTrigger aria-label="Search location">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>{CITIES.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-32">
            <Select value={radius} onValueChange={setRadius}>
              <SelectTrigger aria-label="Search radius">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 km</SelectItem>
                <SelectItem value="10">10 km</SelectItem>
                <SelectItem value="25">25 km</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="border-primary/40" onClick={useMyLocation}>
            <Crosshair className="mr-2 h-4 w-4" /> Use my location
          </Button>
          {customLoc && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" />
              Your location: <span className="font-mono">{customLoc.lat.toFixed(4)}, {customLoc.lng.toFixed(4)}</span>
            </p>
          )}
        </div>

        {bio.loading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        ) : bio.error || !bio.data ? (
          <EmptyState
            icon={<Bird className="h-10 w-10" />}
            title="GBIF unreachable — no snapshot available"
            hint={bio.error ?? "The occurrence service could not be reached. No substitute numbers are shown."}
          />
        ) : (
          <>
            <StatTile
              label="GBIF occurrence records"
              value={fmtNum(bio.data.totalCount, 0)}
              unit="records"
              icon={<MapPin className="h-4 w-4" />}
              sub={`within ${bio.data.radiusKm} km of ${locLabel} · summary based on a sample of ${fmtNum(bio.data.sampledRecords, 0)} records`}
            />

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Most recorded species</h3>
                {bio.data.speciesCounts.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No species in the sample for this area.</p>
                ) : (
                  <div className="scroll-slim max-h-64 space-y-1.5 overflow-y-auto pr-1">
                    {bio.data.speciesCounts.map((s) => (
                      <div key={s.species} className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-background/30 px-3 py-2 text-xs">
                        <span className="truncate italic text-foreground/85">{s.species}</span>
                        <span className="shrink-0 font-mono text-muted-foreground">{s.count} · {s.kingdom}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Recent records</h3>
                {bio.data.recent.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No recent occurrences returned for this area.</p>
                ) : (
                  <div className="scroll-slim max-h-64 overflow-y-auto rounded-xl border border-border/60">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Species</TableHead>
                          <TableHead>Observed</TableHead>
                          <TableHead>Basis</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bio.data.recent.map((r, i) => (
                          <TableRow key={`${r.species}-${r.observedAt}-${i}`}>
                            <TableCell className="max-w-44 truncate italic">{r.species}</TableCell>
                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{fmtDate(r.observedAt, false)}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{r.basisOfRecord}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 rounded-xl border border-border/60 bg-background/40 p-3 text-xs leading-relaxed text-muted-foreground">
              <p><span className="font-medium text-foreground/80">Methodology:</span> {bio.data.analytics.methodology}</p>
              <p><span className="font-medium text-foreground/80">Confidence:</span> {bio.data.analytics.confidence}</p>
              {bio.data.analytics.limitations.length > 0 && (
                <p><span className="font-medium text-foreground/80">Limitations:</span> {bio.data.analytics.limitations.join(" ")}</p>
              )}
            </div>

            <SourcePanel provenance={bio.data.provenance} extra={[{ label: "Confidence", value: bio.data.analytics.confidence }]} />
          </>
        )}
      </GlassCard>

      {/* --------------------- SUBMIT + EDUCATION CARDS --------------------- */}
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Submit an observation</h2>
            <DataBadge kind="self-reported" />
          </div>
          <form className="space-y-4" onSubmit={submitObservation}>
            <div className="space-y-1.5">
              <Label htmlFor="obs-species">Species (or your best guess)</Label>
              <Input
                id="obs-species"
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                required
                placeholder="e.g. Indian cypress, house sparrow"
                maxLength={160}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Kind</Label>
                <Select value={kind} onValueChange={setKind}>
                  <SelectTrigger aria-label="Observation kind"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {KINDS.map((k) => (
                      <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="obs-place">Place name</Label>
                <Input id="obs-place" value={place} onChange={(e) => setPlace(e.target.value)} placeholder="e.g. Lodhi Garden" maxLength={120} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="obs-notes">Notes</Label>
              <Textarea id="obs-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Habitat, behaviour, count — anything useful" rows={3} maxLength={1000} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="obs-photo">Photo (optional, under 1.5 MB)</Label>
              <input
                id="obs-photo"
                type="file"
                accept="image/*"
                onChange={onPhotoChange}
                className="w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-xs file:font-medium file:text-foreground hover:file:bg-secondary/80"
                aria-label="Observation photo"
              />
              {photo && (
                <img src={photo} alt="Selected observation preview" className="mt-2 max-h-40 w-auto rounded-xl border border-border/60 object-cover" />
              )}
            </div>
            <div className="space-y-2">
              <Label>Location (optional)</Label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={latText}
                  onChange={(e) => setLatText(e.target.value)}
                  type="number"
                  step="any"
                  min={-90}
                  max={90}
                  placeholder="Latitude"
                  aria-label="Latitude"
                />
                <Input
                  value={lngText}
                  onChange={(e) => setLngText(e.target.value)}
                  type="number"
                  step="any"
                  min={-180}
                  max={180}
                  placeholder="Longitude"
                  aria-label="Longitude"
                />
              </div>
              <Button type="button" variant="outline" size="sm" className="border-primary/40" onClick={captureFormLocation} disabled={locating}>
                <Crosshair className="mr-1.5 h-3.5 w-3.5" /> {locating ? "Locating..." : "Capture location"}
              </Button>
            </div>
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/85" disabled={busy}>
              <Send className="mr-2 h-4 w-4" /> {busy ? "Saving..." : "Submit observation"}
            </Button>
          </form>
        </GlassCard>

        <GlassCard className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Sprout className="h-5 w-5 text-primary" /> Help pollinators and native species
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Four low-cost ways to make your balcony, garden or campus genuinely useful to local wildlife. None of them
            require purchases or special equipment.
          </p>
          <ol className="space-y-3">
            {POLLINATOR_TIPS.map((tip, i) => (
              <li key={i} className="flex gap-3 rounded-xl border border-border/50 bg-background/30 p-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-mono text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="text-xs leading-relaxed text-foreground/80 md:text-sm">{tip}</span>
              </li>
            ))}
          </ol>
        </GlassCard>
      </div>

      {/* ------------------------ COMMUNITY FEED ------------------------ */}
      <section className="space-y-4" aria-label="Community observations">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Community observations</h2>
          {obs.data && (
            <p className="text-xs text-muted-foreground">
              Showing {observations.length} of {obs.data.observations.length}
            </p>
          )}
        </div>

        {obs.loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (<Skeleton key={i} className="h-44 w-full rounded-2xl" />))}
          </div>
        ) : obs.error ? (
          <p className="text-sm text-destructive">Could not load community observations: {obs.error}</p>
        ) : observations.length === 0 ? (
          <EmptyState icon={<Camera className="h-10 w-10" />} title="No observations yet" hint="Be the first to submit one using the form above." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {observations.map((o) => (
              <GlassCard key={o.id} className="space-y-2.5">
                {o.photo && (
                  <img src={o.photo} alt={`Community photo of ${o.speciesGuess}`} className="max-h-40 w-full rounded-xl object-cover" />
                )}
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium italic leading-snug">{o.speciesGuess}</p>
                  <DataBadge kind="estimate" label={o.kind.toUpperCase()} className="shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {o.observer}
                  {o.placeName ? ` · ${o.placeName}` : ""} · {timeAgo(o.createdAt)}
                  {o.isOwn ? " · yours" : ""}
                </p>
                {o.notes && <p className="line-clamp-2 text-xs leading-relaxed text-foreground/75">{o.notes}</p>}
              </GlassCard>
            ))}
          </div>
        )}

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5 shrink-0 text-chart-3" />
          Exact coordinates are visible only to the submitter; other viewers see locations rounded to ~100 m.
        </p>
      </section>
    </div>
  );
}
