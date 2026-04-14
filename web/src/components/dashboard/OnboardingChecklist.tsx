"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, ChevronRight, Copy, Check, ExternalLink } from "lucide-react";
import type { Podcast } from "@/types";

interface Props {
  podcasts: Podcast[];
}

export function OnboardingChecklist({ podcasts }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const hasPodcast   = podcasts.length > 0;
  const hasEpisode   = podcasts.some((p) => (p.published_episode_count ?? 0) > 0);
  const hasPublished = podcasts.some((p) => p.published);
  const firstSlug    = podcasts[0]?.slug;
  const rssUrl       = podcasts[0]?.rss_url ?? "";

  function copyRss() {
    if (!rssUrl) return;
    navigator.clipboard.writeText(rssUrl);
    setCopied(true);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }

  const completedCount = [hasPodcast, hasEpisode, hasPublished].filter(Boolean).length;

  return (
    <div className="panel engraving-bg mb-8">
      <div className="px-6 pt-5 pb-3 border-b border-ink-800">
        <p className="text-[9px] uppercase tracking-[0.3em] text-accent font-bold mb-0.5">Getting started</p>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-ink-200">
            Three steps to get your show live
          </h2>
          <span className="text-[10px] text-ink-600 uppercase tracking-widest">
            {completedCount}/3 complete
          </span>
        </div>
      </div>

      <div className="divide-y divide-ink-800">
        {/* Step 1 */}
        <div className={`flex items-center gap-4 px-6 py-4 ${hasPodcast ? "opacity-50" : ""}`}>
          <div className="shrink-0">
            {hasPodcast ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-ink-700" />}
          </div>
          <p className={`flex-1 text-sm font-medium ${hasPodcast ? "line-through text-ink-600" : "text-ink-200"}`}>
            Create your podcast
          </p>
          {!hasPodcast && (
            <button
              onClick={() => router.push("/dashboard/podcasts/new")}
              className="flex items-center gap-1 text-[11px] uppercase tracking-widest text-accent hover:text-red-400 font-bold transition-colors shrink-0"
            >
              Create podcast <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Step 2 */}
        <div className={`flex items-center gap-4 px-6 py-4 ${hasEpisode ? "opacity-50" : ""}`}>
          <div className="shrink-0">
            {hasEpisode ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-ink-700" />}
          </div>
          <p className={`flex-1 text-sm font-medium ${hasEpisode ? "line-through text-ink-600" : "text-ink-200"}`}>
            Upload and publish your first episode
          </p>
          {!hasEpisode && firstSlug && (
            <button
              onClick={() => router.push(`/dashboard/podcasts/${firstSlug}`)}
              className="flex items-center gap-1 text-[11px] uppercase tracking-widest text-accent hover:text-red-400 font-bold transition-colors shrink-0"
            >
              Go to podcast <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Step 3 — expanded layout with RSS copy field */}
        <div className={`px-6 py-4 ${hasPublished ? "opacity-50" : ""}`}>
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              {hasPublished ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-ink-700" />}
            </div>
            <p className={`flex-1 text-sm font-medium ${hasPublished ? "line-through text-ink-600" : "text-ink-200"}`}>
              Submit your RSS feed to podcast directories
            </p>
          </div>

          {!hasPublished && hasPodcast && rssUrl && (
            <div className="mt-3 ml-8 space-y-3">
              {/* RSS copy field */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-ink-600 font-bold mb-1.5">Your RSS Feed URL</p>
                <div className="flex items-center border border-ink-700 bg-ink-950">
                  <span className="flex-1 px-3 py-2 text-[11px] font-mono text-ink-400 truncate">{rssUrl}</span>
                  <button
                    onClick={copyRss}
                    className="flex items-center gap-1.5 px-3 py-2 border-l border-ink-700 text-[10px] uppercase tracking-widest font-bold transition-colors shrink-0"
                    style={{ color: copied ? "#5dbf72" : "var(--accent)" }}
                  >
                    {copied ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                  </button>
                </div>
              </div>

              {/* Directory links */}
              <div className="flex flex-wrap gap-4">
                {[
                  { label: "Apple Podcasts", href: "https://podcastsconnect.apple.com" },
                  { label: "Spotify",         href: "https://podcasters.spotify.com" },
                  { label: "Amazon Music",    href: "https://podcasters.amazon.com" },
                ].map((dir) => (
                  <a
                    key={dir.label}
                    href={dir.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] uppercase tracking-widest text-accent hover:text-red-400 font-bold transition-colors"
                  >
                    {dir.label} <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
