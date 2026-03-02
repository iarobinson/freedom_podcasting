"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Rss, Copy, Check, Globe, GlobeLock, Pencil, Trash2, Clock, Mic2, MessageSquare } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { useRole } from "@/lib/useRole";
import { podcastsApi, episodesApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "@/lib/toast";
import type { Podcast, Episode } from "@/types";

function episodeBadgeVariant(status: Episode["status"]) {
  if (status === "published") return "success" as const;
  if (status === "review")    return "warning" as const;
  if (status === "approved")  return "info" as const;
  return "default" as const;
}

export default function PodcastDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { currentOrg } = useAuthStore();
  const { canEdit, canManage } = useRole();
  const [copied, setCopied] = useState(false);
  const [rejectingEpisodeId, setRejectingEpisodeId] = useState<number | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");

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

  const invalidateEpisodes = () => qc.invalidateQueries({ queryKey: ["episodes", currentOrg?.slug, slug] });

  const togglePodcastPublish = useMutation({
    mutationFn: () => podcast?.published
      ? podcastsApi.unpublish(currentOrg!.slug, slug)
      : podcastsApi.publish(currentOrg!.slug, slug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["podcast", currentOrg?.slug, slug] });
      qc.invalidateQueries({ queryKey: ["podcasts", currentOrg?.slug] });
      toast.success(podcast?.published ? "Podcast unpublished" : "Podcast is now live!");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error("Cannot publish", msg ?? "Something went wrong.");
    },
  });

  const publishEpisode = useMutation({
    mutationFn: (ep: Episode) => episodesApi.publish(currentOrg!.slug, slug, ep.id),
    onSuccess: () => { invalidateEpisodes(); toast.success("Episode is now live!"); },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error("Could not publish episode", msg ?? "Make sure audio is uploaded first.");
    },
  });

  const unpublishEpisode = useMutation({
    mutationFn: (ep: Episode) => episodesApi.unpublish(currentOrg!.slug, slug, ep.id),
    onSuccess: () => { invalidateEpisodes(); toast.success("Episode unpublished"); },
  });

  const submitForReview = useMutation({
    mutationFn: (ep: Episode) => episodesApi.submitForReview(currentOrg!.slug, slug, ep.id),
    onSuccess: () => { invalidateEpisodes(); toast.success("Submitted for review"); },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error("Could not submit for review", msg ?? "Something went wrong.");
    },
  });

  const approveEpisode = useMutation({
    mutationFn: (ep: Episode) => episodesApi.approve(currentOrg!.slug, slug, ep.id),
    onSuccess: () => { invalidateEpisodes(); toast.success("Episode approved"); },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error("Could not approve", msg ?? "Something went wrong.");
    },
  });

  const rejectEpisode = useMutation({
    mutationFn: ({ ep, notes }: { ep: Episode; notes: string }) =>
      episodesApi.reject(currentOrg!.slug, slug, ep.id, notes),
    onSuccess: () => {
      invalidateEpisodes();
      setRejectingEpisodeId(null);
      setRejectNotes("");
      toast.success("Changes requested");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error("Could not request changes", msg ?? "Something went wrong.");
    },
  });

  const deleteEpisode = useMutation({
    mutationFn: (id: number) => episodesApi.delete(currentOrg!.slug, slug, id),
    onSuccess: () => { invalidateEpisodes(); toast.success("Episode deleted"); },
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
          <button
            onClick={() => router.push(`/dashboard/podcasts/${slug}/edit`)}
            title="Add artwork"
            className="h-20 w-20 rounded-xl bg-white/5 border-2 border-dashed border-white/15 hover:border-amber-500/40 hover:bg-amber-500/5 flex flex-col items-center justify-center gap-1 shrink-0 transition-colors group">
            <Mic2 className="h-7 w-7 text-ink-600 group-hover:text-amber-500/70 transition-colors" />
            <span className="text-[9px] text-ink-700 group-hover:text-amber-500/70 transition-colors leading-none">Add art</span>
          </button>
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
            {podcast.published && (
              <a href={podcast.rss_url} target="_blank" rel="noopener noreferrer"
                className="text-ink-700 hover:text-accent transition-colors p-1">
                <Rss className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
        {canEdit && (
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
        )}
      </div>

      {/* Episodes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-ink-200">
            Episodes <span className="text-ink-600 text-base font-sans">({episodes.length})</span>
          </h2>
          {canEdit && (
            <Button size="sm" onClick={() => router.push(`/dashboard/podcasts/${slug}/episodes/new`)}>
              <Plus className="h-3.5 w-3.5" /> New Episode
            </Button>
          )}
        </div>

        {episodes.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <Mic2 className="h-8 w-8 text-ink-700 mx-auto mb-3" />
            <p className="text-ink-400 text-sm mb-4">No episodes yet. Add your first one!</p>
            {canEdit && (
              <Button size="sm" onClick={() => router.push(`/dashboard/podcasts/${slug}/episodes/new`)}>
                <Plus className="h-3.5 w-3.5" /> Add Episode
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {episodes.map((ep) => (
              <div key={ep.id}>
                <div className="glass glass-hover rounded-xl px-4 py-3.5 flex items-center gap-3 group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-[11px] font-mono text-ink-600">
                        {ep.season_number ? `S${ep.season_number}·` : ""}E{ep.episode_number ?? "—"}
                      </span>
                      <p className="text-sm font-medium text-ink-200 truncate">{ep.title}</p>
                      <Badge variant={episodeBadgeVariant(ep.status)}>
                        {ep.status === "review" ? "In Review" : ep.status}
                      </Badge>
                    </div>
                    {/* Feedback note from reviewer */}
                    {ep.status === "draft" && ep.review_notes && (
                      <div className="flex items-start gap-1.5 mt-1 mb-0.5">
                        <MessageSquare className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-amber-500/80 leading-snug">{ep.review_notes}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-xs text-ink-600">
                      {ep.formatted_duration && (
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ep.formatted_duration}</span>
                      )}
                      {ep.published_at && <span>{new Date(ep.published_at).toLocaleDateString()}</span>}
                      {!ep.audio_url && <span className="text-amber-500">⚠ No audio</span>}
                    </div>
                  </div>

                  {/* Actions — context-sensitive by status + role */}
                  {canEdit && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {ep.status === "draft" && (
                        <>
                          <button
                            onClick={() => submitForReview.mutate(ep)}
                            disabled={submitForReview.isPending}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors">
                            Submit for Review
                          </button>
                          <button
                            onClick={() => publishEpisode.mutate(ep)}
                            disabled={publishEpisode.isPending}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-brand-500/15 text-brand-400 hover:bg-brand-500/25 transition-colors">
                            Publish
                          </button>
                        </>
                      )}

                      {ep.status === "review" && canManage && (
                        <>
                          <button
                            onClick={() => approveEpisode.mutate(ep)}
                            disabled={approveEpisode.isPending}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors">
                            Approve
                          </button>
                          <button
                            onClick={() => { setRejectingEpisodeId(ep.id); setRejectNotes(""); }}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors">
                            Request Changes
                          </button>
                        </>
                      )}

                      {ep.status === "approved" && (
                        <button
                          onClick={() => publishEpisode.mutate(ep)}
                          disabled={publishEpisode.isPending}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                          Publish
                        </button>
                      )}

                      {ep.status === "published" && (
                        <button
                          onClick={() => unpublishEpisode.mutate(ep)}
                          disabled={unpublishEpisode.isPending}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-red-500/10 hover:text-red-400 transition-colors">
                          Unpublish
                        </button>
                      )}

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
                  )}
                </div>

                {/* Inline rejection form */}
                {rejectingEpisodeId === ep.id && (
                  <div className="glass rounded-xl px-4 py-3 mt-1 ml-4 border border-amber-500/20">
                    <p className="text-[11px] text-ink-500 uppercase tracking-widest mb-2">Feedback for the producer</p>
                    <textarea
                      value={rejectNotes}
                      onChange={(e) => setRejectNotes(e.target.value)}
                      placeholder="Describe what needs to change..."
                      className="w-full bg-ink-900 border border-ink-700 rounded-lg px-3 py-2 text-sm text-ink-200 placeholder:text-ink-600 focus:outline-none focus:border-accent resize-none"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="sm"
                        loading={rejectEpisode.isPending}
                        onClick={() => rejectEpisode.mutate({ ep, notes: rejectNotes })}>
                        Send Feedback
                      </Button>
                      <button
                        onClick={() => { setRejectingEpisodeId(null); setRejectNotes(""); }}
                        className="text-xs text-ink-600 hover:text-ink-400 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
