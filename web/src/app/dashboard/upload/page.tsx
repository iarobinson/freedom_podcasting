"use client";
import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Mic2, Plus, FileAudio, Archive } from "lucide-react";
import { clsx } from "clsx";
import { useAuthStore } from "@/lib/store";
import { podcastsApi, episodesApi } from "@/lib/api";
import { AudioUploader } from "@/components/upload/AudioUploader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "@/lib/toast";
import type { Podcast, Episode } from "@/types";

type Destination = { kind: "new" } | { kind: "draft"; episode: Episode };

function Step({ n, title, done, active, children }: { n: number; title: string; done: boolean; active: boolean; children?: React.ReactNode }) {
  return (
    <div className={clsx("glass rounded-2xl p-6", !active && !done && "opacity-50")}>
      <div className="flex items-center gap-3 mb-1">
        <span className={clsx(
          "h-6 w-6 flex items-center justify-center text-[11px] font-bold border",
          done ? "bg-accent border-accent text-white" : active ? "border-accent text-accent" : "border-ink-700 text-ink-600"
        )}>{n}</span>
        <h2 className="text-xs font-bold uppercase tracking-widest text-ink-300">{title}</h2>
      </div>
      {(active || done) && children && <div className="mt-4">{children}</div>}
    </div>
  );
}

export default function UploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentOrg } = useAuthStore();
  const [podcastSlug, setPodcastSlug] = useState<string>(searchParams.get("podcast") ?? "");
  const [destination, setDestination] = useState<Destination | null>(null);
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [episodeId, setEpisodeId] = useState<number | null>(null);
  const [uploaded, setUploaded] = useState(false);

  const { data: podcasts = [], isLoading } = useQuery<Podcast[]>({
    queryKey: ["podcasts", currentOrg?.slug],
    queryFn:  () => podcastsApi.list(currentOrg!.slug).then((r) => r.data.data),
    enabled:  !!currentOrg,
  });

  const { data: drafts = [] } = useQuery<Episode[]>({
    queryKey: ["episodes", currentOrg?.slug, podcastSlug],
    queryFn:  () => episodesApi.list(currentOrg!.slug, podcastSlug).then((r) => r.data.data),
    enabled:  !!currentOrg && !!podcastSlug,
    select:   (eps) => eps.filter((e) => e.status === "draft"),
  });

  const podcast = podcasts.find((p) => p.slug === podcastSlug);

  // Create the episode (or reuse the draft) the moment a file is chosen,
  // so the upload attaches to it — same flow as the New Episode page.
  const resolveEpisode = useCallback(async () => {
    if (!currentOrg || !destination) return undefined;
    if (destination.kind === "draft") { setEpisodeId(destination.episode.id); return destination.episode.id; }
    const res = await episodesApi.create(currentOrg.slug, podcastSlug, { episode_type: "full" });
    const id = res.data.data.id as number;
    setEpisodeId(id);
    return id;
  }, [currentOrg, destination, podcastSlug]);

  const choosePodcast = (slug: string) => { setPodcastSlug(slug); setDestination(null); setFile(null); setEpisodeId(null); setUploaded(false); };

  if (currentOrg?.plan === "archive") {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <EmptyState
          icon={Archive}
          title="Your workspace is on the Archive plan."
          body="Archive keeps your existing catalogue and feed live, but doesn't accept new uploads. Upgrade to start publishing again."
          primary={<Button onClick={() => router.push("/dashboard/settings/billing")}>View plans</Button>}
        />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl text-ink-100 mb-1">Upload audio</h1>
        <p className="text-sm text-ink-500">Add an audio file to a new or existing episode.</p>
      </div>

      {isLoading ? (
        <div className="glass rounded-2xl h-48 shimmer-bg" />
      ) : podcasts.length === 0 ? (
        <EmptyState
          icon={Mic2}
          title="Create your first podcast"
          body="Set up your show, upload audio, and publish from one place."
          primary={<Button onClick={() => router.push("/dashboard/podcasts/new")}><Plus className="h-4 w-4" /> Create your first podcast</Button>}
        />
      ) : (
        <div className="space-y-3">
          <Step n={1} title="Select podcast" done={!!podcast} active={!podcast}>
            <p className="text-xs text-ink-500 mb-3">Choose which podcast this audio belongs to.</p>
            <div className="grid gap-2">
              {podcasts.map((p) => (
                <button key={p.id} onClick={() => choosePodcast(p.slug)} disabled={!!file}
                  className={clsx(
                    "flex items-center gap-3 w-full p-3 text-left border transition-colors disabled:cursor-not-allowed",
                    podcastSlug === p.slug ? "border-accent/50 bg-accent/5" : "border-ink-800 hover:border-ink-600 hover:bg-ink-800/50"
                  )}>
                  {p.artwork_url ? (
                    <img src={p.artwork_url} alt="" className="h-10 w-10 object-cover shrink-0" />
                  ) : (
                    <div className="h-10 w-10 bg-ink-800 flex items-center justify-center shrink-0"><Mic2 className="h-5 w-5 text-ink-500" /></div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-ink-200">{p.title}</p>
                    <p className="text-xs text-ink-600">{p.episode_count} episode{p.episode_count === 1 ? "" : "s"}</p>
                  </div>
                </button>
              ))}
            </div>
          </Step>

          <Step n={2} title="Choose destination" done={!!destination} active={!!podcast && !destination}>
            <div className="grid sm:grid-cols-2 gap-2">
              <button onClick={() => setDestination({ kind: "new" })} disabled={!!file}
                className={clsx("p-4 text-left border transition-colors disabled:cursor-not-allowed",
                  destination?.kind === "new" ? "border-accent/50 bg-accent/5" : "border-ink-800 hover:border-ink-600")}>
                <p className="text-sm font-medium text-ink-200">Create a new episode</p>
                <p className="text-xs text-ink-600 mt-0.5">Starts a new draft for this audio.</p>
              </button>
              <div className={clsx("p-4 border", destination?.kind === "draft" ? "border-accent/50 bg-accent/5" : "border-ink-800")}>
                <p className="text-sm font-medium text-ink-200 mb-2">Attach to an existing draft</p>
                {drafts.length === 0 ? (
                  <p className="text-xs text-ink-600">No drafts in this podcast.</p>
                ) : (
                  <select
                    disabled={!!file}
                    value={destination?.kind === "draft" ? destination.episode.id : ""}
                    onChange={(e) => {
                      const ep = drafts.find((d) => d.id === Number(e.target.value));
                      if (ep) setDestination({ kind: "draft", episode: ep });
                    }}
                    className="w-full px-2 py-1.5 text-xs bg-ink-900 border border-ink-700 text-ink-100 focus:outline-none focus:border-accent/50">
                    <option value="">Select a draft…</option>
                    {drafts.map((d) => (
                      <option key={d.id} value={d.id}>{d.title || "Untitled draft"}{d.audio_url ? " (replaces audio)" : ""}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </Step>

          <Step n={3} title="Upload audio" done={uploaded} active={!!destination && !uploaded}>
            <p className="text-xs text-ink-500 mb-3">Upload an MP3 or M4A file to attach to a new or existing episode. Max 500 MB.</p>
            {currentOrg && podcastSlug && (
              <AudioUploader
                key={`${podcastSlug}-${destination?.kind === "draft" ? destination.episode.id : "new"}`}
                orgSlug={currentOrg.slug}
                podcastSlug={podcastSlug}
                onFileSelected={resolveEpisode}
                onFileChosen={(f) => setFile({ name: f.name, size: f.size })}
                onUploadComplete={() => { setUploaded(true); toast.success("Audio uploaded", "Review the details below to continue."); }}
                onError={(err) => toast.error("Upload failed", err)}
              />
            )}
          </Step>

          {uploaded && file && episodeId && podcast && destination && (
            <Step n={4} title="Review and continue" done={false} active>
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm mb-6">
                <dt className="text-ink-600 text-xs uppercase tracking-widest">File</dt>
                <dd className="text-ink-200 flex items-center gap-1.5 min-w-0"><FileAudio className="h-3.5 w-3.5 text-ink-500 shrink-0" /><span className="truncate">{file.name}</span></dd>
                <dt className="text-ink-600 text-xs uppercase tracking-widest">Size</dt>
                <dd className="text-ink-200">{(file.size / 1024 / 1024).toFixed(1)} MB</dd>
                <dt className="text-ink-600 text-xs uppercase tracking-widest">Duration</dt>
                <dd className="text-ink-400 text-xs">Calculated after processing</dd>
                <dt className="text-ink-600 text-xs uppercase tracking-widest">Podcast</dt>
                <dd className="text-ink-200">{podcast.title}</dd>
                <dt className="text-ink-600 text-xs uppercase tracking-widest">Episode</dt>
                <dd className="text-ink-200">{destination.kind === "new" ? "New draft episode" : destination.episode.title || "Existing draft"}</dd>
              </dl>
              <div className="flex gap-3 flex-wrap">
                <Button onClick={() => router.push(`/dashboard/podcasts/${podcastSlug}/episodes/${episodeId}/edit`)}>
                  Continue to episode details <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="secondary" onClick={() => { toast.success("Saved as draft"); router.push(`/dashboard/podcasts/${podcastSlug}`); }}>
                  Save as draft
                </Button>
              </div>
            </Step>
          )}

          <p className="text-[11px] text-ink-600 pt-2">
            Prefer to start with episode details? <Link href={podcastSlug ? `/dashboard/podcasts/${podcastSlug}/episodes/new` : "/dashboard/podcasts"} className="text-ink-400 hover:text-ink-200 underline">Create an episode instead</Link>.
          </p>
        </div>
      )}
    </div>
  );
}
