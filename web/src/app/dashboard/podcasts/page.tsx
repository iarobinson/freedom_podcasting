"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus, Mic2, ArrowRight, Copy, Check, ExternalLink, Download } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/lib/store";
import { useRole } from "@/lib/useRole";
import { podcastsApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

type Filter = "all" | "draft" | "live";
import type { Podcast } from "@/types";

export default function PodcastsPage() {
  const router = useRouter();
  const { currentOrg } = useAuthStore();
  const { canEdit } = useRole();
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["podcasts", currentOrg?.slug],
    queryFn:  () => podcastsApi.list(currentOrg!.slug).then((r) => r.data.data as Podcast[]),
    enabled:  !!currentOrg,
  });

  const podcasts = data ?? [];
  const visible = podcasts.filter((p) => filter === "all" || (filter === "live") === p.published);

  const copyRss = async (podcast: Podcast) => {
    await navigator.clipboard.writeText(podcast.rss_url);
    setCopiedId(podcast.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl text-ink-100 mb-1">Podcasts</h1>
          <p className="text-sm text-ink-500">Manage your podcasts, feeds, and publishing status</p>
        </div>
        {canEdit && (
          <Button onClick={() => router.push("/dashboard/podcasts/new")}>
            <Plus className="h-4 w-4" /> New podcast
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3].map((i) => <div key={i} className="glass rounded-xl h-20 shimmer-bg" />)}
        </div>
      ) : podcasts.length === 0 ? (
        <EmptyState
          icon={Mic2}
          title="You're one step away from publishing."
          body="Create your show, upload audio, and publish from one clean dashboard."
          primary={canEdit && <Button onClick={() => router.push("/dashboard/podcasts/new")}><Plus className="h-4 w-4" /> Create your first podcast</Button>}
          secondary={canEdit && <Button variant="secondary" onClick={() => router.push("/dashboard/podcasts/new?mode=import")}><Download className="h-4 w-4" /> Import an existing show</Button>}
        />
      ) : (
        <>
          {podcasts.length > 3 && (
            <div className="flex gap-1 mb-4">
              {(["all", "draft", "live"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border transition-colors ${filter === f ? "border-accent text-accent" : "border-ink-800 text-ink-500 hover:text-ink-300"}`}>
                  {f}
                </button>
              ))}
            </div>
          )}
          <div className="space-y-2">
            {visible.map((podcast) => (
              <div key={podcast.id} className="glass rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {podcast.artwork_url ? (
                    <img src={podcast.artwork_url} alt={podcast.title} className="h-14 w-14 object-cover shrink-0" />
                  ) : (
                    <div className="h-14 w-14 bg-ink-800 flex items-center justify-center shrink-0">
                      <Mic2 className="h-7 w-7 text-ink-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Link href={`/dashboard/podcasts/${podcast.slug}`} className="font-medium text-ink-200 hover:text-ink-50 truncate">{podcast.title}</Link>
                      <Badge variant={podcast.published ? "live" : "default"}>{podcast.published ? "Live" : "Draft"}</Badge>
                    </div>
                    <p className="text-xs text-ink-500 truncate">
                      {podcast.author || "No author set"} · {podcast.episode_count} episode{podcast.episode_count === 1 ? "" : "s"} · Updated {new Date(podcast.updated_at).toLocaleDateString()}
                    </p>
                    <div className="mt-2 flex items-center gap-3 flex-wrap" title="This is the feed you submit to podcast directories.">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-ink-600">RSS feed</span>
                      <button onClick={() => copyRss(podcast)} className="flex items-center gap-1 text-[11px] text-ink-500 hover:text-ink-200 transition-colors">
                        {copiedId === podcast.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        {copiedId === podcast.id ? "Copied" : "Copy feed"}
                      </button>
                      <a href={podcast.rss_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] text-ink-500 hover:text-ink-200 transition-colors">
                        <ExternalLink className="h-3 w-3" /> Open feed
                      </a>
                    </div>
                  </div>
                </div>
                <Link href={`/dashboard/podcasts/${podcast.slug}`}
                  className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-ink-400 hover:text-ink-100 transition-colors px-3 py-2 border border-ink-800 hover:border-ink-600 shrink-0 self-start sm:self-center">
                  Manage <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-ink-600 mt-4">Your RSS feed is the link you submit to Apple Podcasts, Spotify, and other podcast directories.</p>
        </>
      )}
    </div>
  );
}
