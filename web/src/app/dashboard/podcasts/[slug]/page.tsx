"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Rss, Copy, Check, Globe, GlobeLock, Pencil, Trash2, Clock, Mic2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { podcastsApi, episodesApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "@/lib/toast";
import type { Podcast, Episode } from "@/types";

export default function PodcastDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { currentOrg } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const { data: podcast, isLoading } = useQuery<Podcast>({
    queryKey: ["podcast", currentOrg?.slug, slug],
    queryFn:  () => podcastsApi.get(currentOrg!.slug, slug).then((r) => r.data.data),
    enabled:  !!currentOrg,
  });

  const { data: episodesData } = useQuery({
    queryKey: ["episodes", currentOrg?.slug, slug],
    queryFn:  () => episodesApi.list(currentOrg!.slug, slug).then((r) => r.data),
    enabled:  !!currentOrg,
  });

  const togglePodcastPublish = useMutation({
    mutationFn: () => podcast?.published
      ? podcastsApi.unpublish(currentOrg!.slug, slug)
      : podcastsApi.publish(currentOrg!.slug, slug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["podcast", currentOrg?.slug, slug] });
      qc.invalidateQueries({ queryKey: ["podcasts", currentOrg?.slug] });
      toast.success(podcast?.published ? "Podcast unpublished" : "Podcast is now live!");
    },
  });

  const toggleEpisodePublish = useMutation({
    mutationFn: (ep: Episode) => ep.status === "published"
      ? episodesApi.unpublish(currentOrg!.slug, slug, ep.id)
      : episodesApi.publish(currentOrg!.slug, slug, ep.id),
    onSuccess: (_, ep) => {
      qc.invalidateQueries({ queryKey: ["episodes", currentOrg?.slug, slug] });
      toast.success(ep.status === "published" ? "Episode unpublished" : "Episode is now live!");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error("Could not publish episode", msg ?? "Make sure audio is uploaded first.");
    },
  });

  const deleteEpisode = useMutation({
    mutationFn: (id: number) => episodesApi.delete(currentOrg!.slug, slug, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["episodes", currentOrg?.slug, slug] });
      toast.success("Episode deleted");
    },
  });

  const copyRss = async () => {
    if (!podcast) return;
    await navigator.clipboard.writeText(podcast.rss_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const episodes: Episode[] = episodesData?.data ?? [];

  if (isLoading) return <div className="p-8"><div className="glass rounded-2xl h-48 shimmer-bg" /></div>;
  if (!podcast)  return <div className="p-8 text-ink-500">Podcast not found.</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-300 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> All Podcasts
      </button>

      {/* Podcast header */}
      <div className="glass rounded-2xl p-6 mb-6 flex items-start gap-5">
        {podcast.artwork_url ? (
          <img src={podcast.artwork_url} alt={podcast.title} className="h-20 w-20 rounded-xl object-cover shrink-0" />
        ) : (
          <div className="h-20 w-20 rounded-xl bg-brand-500/15 flex items-center justify-center shrink-0">
            <Mic2 className="h-10 w-10 text-brand-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="font-display text-2xl text-ink-100">{podcast.title}</h1>
            <Badge variant={podcast.published ? "success" : "default"}>{podcast.published ? "Live" : "Draft"}</Badge>
          </div>
          <p className="text-sm text-ink-500 mb-3 line-clamp-2">{podcast.description}</p>
          <div className="flex items-center gap-1.5">
            <code className="text-xs text-ink-600 font-mono truncate max-w-xs">{podcast.rss_url}</code>
            <button onClick={copyRss} className="text-ink-600 hover:text-brand-400 transition-colors p-1">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <a href={podcast.rss_url} target="_blank" rel="noopener noreferrer"
              className="text-ink-600 hover:text-brand-400 transition-colors p-1">
            {podcast.published && (
              <a href={podcast.rss_url} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-ink-700 hover:text-accent transition-colors">
                <Rss className="h-3.5 w-3.5" />
              </a>
            )}
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="secondary" size="sm" onClick={() => router.push(`/dashboard/podcasts/${slug}/edit`)}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button
            variant={podcast.published ? "secondary" : "primary"}
            size="sm"
            loading={togglePodcastPublish.isPending}
            onClick={() => togglePodcastPublish.mutate()}>
            {podcast.published
              ? <><GlobeLock className="h-3.5 w-3.5" /> Unpublish</>
              : <><Globe className="h-3.5 w-3.5" /> Publish</>}
          </Button>
        </div>
      </div>

      {/* Episodes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-ink-200">
            Episodes <span className="text-ink-600 text-base font-sans">({episodes.length})</span>
          </h2>
          <Button size="sm" onClick={() => router.push(`/dashboard/podcasts/${slug}/episodes/new`)}>
            <Plus className="h-3.5 w-3.5" /> New Episode
          </Button>
        </div>

        {episodes.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <Mic2 className="h-8 w-8 text-ink-700 mx-auto mb-3" />
            <p className="text-ink-400 text-sm mb-4">No episodes yet. Add your first one!</p>
            <Button size="sm" onClick={() => router.push(`/dashboard/podcasts/${slug}/episodes/new`)}>
              <Plus className="h-3.5 w-3.5" /> Add Episode
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {episodes.map((ep) => (
              <div key={ep.id} className="glass glass-hover rounded-xl px-4 py-3.5 flex items-center gap-3 group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-[11px] font-mono text-ink-600">
                      {ep.season_number ? `S${ep.season_number}·` : ""}E{ep.episode_number ?? "—"}
                    </span>
                    <p className="text-sm font-medium text-ink-200 truncate">{ep.title}</p>
                    <Badge variant={ep.status === "published" ? "success" : ep.status === "scheduled" ? "warning" : "default"}>
                      {ep.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-ink-600">
                    {ep.formatted_duration && (
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ep.formatted_duration}</span>
                    )}
                    {ep.published_at && <span>{new Date(ep.published_at).toLocaleDateString()}</span>}
                    {!ep.audio_url && <span className="text-amber-500">⚠ No audio</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Publish/unpublish toggle */}
                  <button
                    onClick={() => toggleEpisodePublish.mutate(ep)}
                    disabled={toggleEpisodePublish.isPending}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      ep.status === "published"
                        ? "bg-emerald-500/10 text-emerald-400 hover:bg-red-500/10 hover:text-red-400"
                        : "bg-brand-500/15 text-brand-400 hover:bg-brand-500/25"
                    }`}>
                    {ep.status === "published" ? "Unpublish" : "Publish"}
                  </button>

                  {/* Edit */}
                  <Link href={`/dashboard/podcasts/${slug}/episodes/${ep.id}/edit`}
                    className="p-1.5 text-ink-600 hover:text-ink-300 hover:bg-white/5 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>

                  {/* Delete */}
                  <button
                    onClick={() => { if (confirm("Delete this episode?")) deleteEpisode.mutate(ep.id); }}
                    className="p-1.5 text-ink-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
