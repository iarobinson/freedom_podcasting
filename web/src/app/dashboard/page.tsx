"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Radio, Upload, Rss, Plus, ArrowRight, Mic2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { podcastsApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Podcast } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, currentOrg, token } = useAuthStore();

  useEffect(() => {
    if (!token) router.push("/auth/login");
  }, [token, router]);

  const { data } = useQuery({
    queryKey: ["podcasts", currentOrg?.slug],
    queryFn:  () => podcastsApi.list(currentOrg!.slug).then((r) => r.data.data as Podcast[]),
    enabled:  !!currentOrg,
  });

  const podcasts = data ?? [];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10 animate-fade-up">
        <p className="text-ink-500 text-sm mb-1">{greeting}</p>
        <h1 className="font-display text-3xl text-ink-100">{user?.first_name ?? "there"} <span className="text-gradient">✦</span></h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "Podcasts", value: podcasts.length, icon: Radio },
          { label: "Published", value: podcasts.filter((p) => p.published).length, icon: Rss },
          { label: "Total Episodes", value: podcasts.reduce((s, p) => s + p.episode_count, 0), icon: Mic2 },
        ].map((stat, i) => (
          <div key={i} className="glass rounded-xl p-5 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-ink-500 uppercase tracking-wider">{stat.label}</span>
              <stat.icon className="h-4 w-4 text-ink-700" />
            </div>
            <p className="font-display text-3xl text-ink-100">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Podcasts section */}
      <div className="animate-fade-up" style={{ animationDelay: "180ms" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-ink-200">Your Podcasts</h2>
          <Button variant="secondary" size="sm" onClick={() => router.push("/dashboard/podcasts/new")}>
            <Plus className="h-3.5 w-3.5" /> New Podcast
          </Button>
        </div>

        {podcasts.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/15 mx-auto mb-4">
              <Mic2 className="h-7 w-7 text-brand-400" />
            </div>
            <h3 className="font-display text-xl text-ink-200 mb-2">No podcasts yet</h3>
            <p className="text-sm text-ink-500 mb-6 max-w-xs mx-auto">Create your first podcast to get an RSS feed and start publishing episodes.</p>
            <Button onClick={() => router.push("/dashboard/podcasts/new")}>
              <Plus className="h-4 w-4" /> Create your first podcast
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {podcasts.map((podcast) => (
              <Link key={podcast.id} href={`/dashboard/podcasts/${podcast.slug}`}
                className="glass glass-hover rounded-xl p-4 flex items-center gap-4 group">
                {podcast.artwork_url ? (
                  <img src={podcast.artwork_url} alt={podcast.title} className="h-12 w-12 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-brand-500/15 flex items-center justify-center shrink-0">
                    <Mic2 className="h-6 w-6 text-brand-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-ink-200 truncate">{podcast.title}</p>
                    <Badge variant={podcast.published ? "success" : "default"}>
                      {podcast.published ? "Live" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-xs text-ink-600">{podcast.episode_count} episodes · {podcast.author}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-ink-600">
                    <Rss className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">RSS</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-ink-700 group-hover:text-ink-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="mt-8 grid grid-cols-2 gap-3 animate-fade-up" style={{ animationDelay: "240ms" }}>
        <Link href="/dashboard/upload" className="glass glass-hover rounded-xl p-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/15">
            <Upload className="h-4 w-4 text-brand-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-ink-200">Upload Audio</p>
            <p className="text-xs text-ink-600">Add a new episode</p>
          </div>
        </Link>
        <Link href="/dashboard/podcasts" className="glass glass-hover rounded-xl p-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/15">
            <Radio className="h-4 w-4 text-brand-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-ink-200">Manage Shows</p>
            <p className="text-xs text-ink-600">Edit podcasts & episodes</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
