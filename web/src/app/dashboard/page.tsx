"use client";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus, Mic2, Radio, Rss, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { podcastsApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Podcast } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, currentOrg } = useAuthStore();

  const { data: podcasts = [], isLoading } = useQuery<Podcast[]>({
    queryKey: ["podcasts", currentOrg?.slug],
    queryFn:  () => podcastsApi.list(currentOrg!.slug).then((r) => r.data.data),
    enabled:  !!currentOrg,
  });

  const published = podcasts.filter((p) => p.published);
  const totalEps  = podcasts.reduce((s, p) => s + (p.episode_count ?? 0), 0);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10 engraving-bg py-6 border-b border-ink-800">
        <p className="text-[9px] uppercase tracking-[0.3em] text-accent font-bold mb-1">
          Welcome back
        </p>
        <h1 className="text-2xl font-bold uppercase tracking-widest text-ink-100">
          {user?.first_name} {user?.last_name}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-px bg-ink-800 mb-8 border border-ink-800">
        {[
          { label: "Podcasts",  value: podcasts.length },
          { label: "Published", value: published.length },
          { label: "Episodes",  value: totalEps },
        ].map(({ label, value }) => (
          <div key={label} className="bg-ink-950 px-6 py-5">
            <p className="text-[9px] uppercase tracking-widest text-ink-600 font-bold mb-1">{label}</p>
            <p className="text-3xl font-bold text-ink-100">{value}</p>
          </div>
        ))}
      </div>

      {/* Podcasts */}
      <div className="mb-6 flex items-center justify-between">
        <div className="ornament-divider flex-1">
          <span>Your Podcasts</span>
        </div>
        <Button size="sm" onClick={() => router.push("/dashboard/podcasts/new")} className="ml-4 shrink-0">
          <Plus className="h-3 w-3" /> New Podcast
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-px">
          {[1,2,3].map((i) => <div key={i} className="h-16 shimmer-bg" />)}
        </div>
      ) : podcasts.length === 0 ? (
        <div className="panel p-12 text-center engraving-bg">
          <Radio className="h-8 w-8 text-ink-700 mx-auto mb-4" />
          <p className="text-xs uppercase tracking-widest text-ink-500 mb-6">No podcasts yet</p>
          <Button onClick={() => router.push("/dashboard/podcasts/new")}>
            <Plus className="h-3.5 w-3.5" /> Create Your First Podcast
          </Button>
        </div>
      ) : (
        <div className="space-y-px border border-ink-800">
          {podcasts.map((p) => (
            <div
              key={p.id}
              onClick={() => router.push(`/dashboard/podcasts/${p.slug}`)}
              className="flex items-center gap-4 px-5 py-4 bg-ink-950 hover:bg-ink-900 cursor-pointer transition-colors group border-l-2 border-transparent hover:border-accent">
              {p.artwork_url ? (
                <img src={p.artwork_url} alt={p.title} className="h-10 w-10 object-cover shrink-0" />
              ) : (
                <div className="h-10 w-10 border border-ink-800 flex items-center justify-center shrink-0">
                  <Mic2 className="h-4 w-4 text-ink-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-bold uppercase tracking-wide text-ink-200 group-hover:text-ink-100 transition-colors truncate">{p.title}</p>
                  <Badge variant={p.published ? "success" : "default"}>{p.published ? "Live" : "Draft"}</Badge>
                </div>
                <p className="text-[11px] text-ink-600 uppercase tracking-wider">{p.episode_count ?? 0} episodes</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <a href={p.rss_url} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-ink-700 hover:text-accent transition-colors">
                  {p.published && (
                    <a href={p.rss_url} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-ink-700 hover:text-accent transition-colors">
                      <Rss className="h-3.5 w-3.5" />
                    </a>
                  )}
                </a>
                <ArrowRight className="h-3.5 w-3.5 text-ink-700 group-hover:text-accent transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
