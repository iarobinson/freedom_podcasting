"use client";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import type { Podcast } from "@/types";

interface Props {
  podcasts: Podcast[];
}

export function OnboardingChecklist({ podcasts }: Props) {
  const router = useRouter();

  const hasPodcast    = podcasts.length > 0;
  const hasEpisode    = podcasts.some((p) => (p.episode_count ?? 0) > 0);
  const hasPublished  = podcasts.some((p) => p.published);
  const firstSlug     = podcasts[0]?.slug;

  type Step = {
    label:   string;
    done:    boolean;
    cta?:    string;
    onClick?: () => void;
    links?:  { label: string; href: string }[];
  };

  const steps: Step[] = [
    {
      label:   "Create your podcast",
      done:    hasPodcast,
      cta:     "Create podcast",
      onClick: () => router.push("/dashboard/podcasts/new"),
    },
    {
      label:   "Upload and publish your first episode",
      done:    hasEpisode,
      cta:     "Go to podcast",
      onClick: () => { if (firstSlug) router.push(`/dashboard/podcasts/${firstSlug}`); },
    },
    {
      label:  "Submit to Apple Podcasts & Spotify",
      done:   hasPublished,
      links:  [
        { label: "Apple Podcasts", href: "https://podcastsconnect.apple.com" },
        { label: "Spotify",        href: "https://podcasters.spotify.com" },
      ],
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;

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
        {steps.map((step, i) => (
          <div key={i} className={`flex items-center gap-4 px-6 py-4 ${step.done ? "opacity-50" : ""}`}>
            <div className="shrink-0">
              {step.done
                ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                : <Circle        className="h-4 w-4 text-ink-700" />
              }
            </div>

            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${step.done ? "line-through text-ink-600" : "text-ink-200"}`}>
                {step.label}
              </p>
            </div>

            {!step.done && step.cta && (
              <button
                onClick={step.onClick ?? undefined}
                className="flex items-center gap-1 text-[11px] uppercase tracking-widest text-accent hover:text-red-400 font-bold transition-colors shrink-0"
              >
                {step.cta}
                <ChevronRight className="h-3 w-3" />
              </button>
            )}

            {!step.done && step.links && (
              <div className="flex items-center gap-3 shrink-0">
                {step.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] uppercase tracking-widest text-accent hover:text-red-400 font-bold transition-colors flex items-center gap-1"
                  >
                    {link.label}
                    <ChevronRight className="h-3 w-3" />
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
