"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus, Mic2, ArrowRight, Rss, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/lib/store";
import { useRole } from "@/lib/useRole";
import { podcastsApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Podcast } from "@/types";

export default function PodcastsPage() {
  const router = useRouter();
  const { currentOrg } = useAuthStore();
  const { canEdit } = useRole();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["podcasts", currentOrg?.slug],
    queryFn:  () => podcastsApi.list(currentOrg!.slug).then((r) => r.data.data as Podcast[]),
    enabled:  !!currentOrg,
  });

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
          <p className="text-sm text-ink-500">Manage your shows and RSS feeds</p>
        </div>
        {canEdit && (
          <Button onClick={() => router.push("/dashboard/podcasts/new")}>
            <Plus className="h-4 w-4" /> New Podcast
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3].map((i) => <div key={i} className="glass rounded-xl h-20 shimmer-bg" />)}
        </div>
      ) : (data ?? []).length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <Mic2 className="h-10 w-10 text-ink-700 mx-auto mb-4" />
          <h3 className="font-display text-xl text-ink-300 mb-2">No podcasts yet</h3>
          <p className="text-sm text-ink-600 mb-6">Create your first podcast to get started.</p>
          {canEdit && <Button onClick={() => router.push("/dashboard/podcasts/new")}><Plus className="h-4 w-4" /> Create Podcast</Button>}
        </div>
      ) : (
        <div className="space-y-2">
          {(data ?? []).map((podcast) => (
            <div key={podcast.id} className="glass rounded-xl p-4 flex items-center gap-4 group">
              {podcast.artwork_url ? (
                <img src={podcast.artwork_url} alt={podcast.title} className="h-14 w-14 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="h-14 w-14 rounded-xl bg-brand-500/15 flex items-center justify-center shrink-0">
                  <Mic2 className="h-7 w-7 text-brand-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-ink-200">{podcast.title}</p>
                  <Badge variant={podcast.published ? "success" : "default"}>{podcast.published ? "Live" : "Draft"}</Badge>
                </div>
                <p className="text-xs text-ink-600 truncate">{podcast.episode_count} episodes · {podcast.category ?? "Uncategorized"}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <code className="text-[10px] text-ink-600 font-mono truncate max-w-xs">{podcast.rss_url}</code>
                  <button onClick={() => copyRss(podcast)} className="text-ink-600 hover:text-brand-400 transition-colors p-0.5">
                    {copiedId === podcast.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={podcast.rss_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-brand-400 transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
                  <Rss className="h-3.5 w-3.5" /> RSS
                </a>
                <Link href={`/dashboard/podcasts/${podcast.slug}`}
                  className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-200 transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
                  Manage <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
