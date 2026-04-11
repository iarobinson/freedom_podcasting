"use client";
import { useState, useEffect, useRef } from "react";
import { X, Copy, Check, ExternalLink } from "lucide-react";

interface Props {
  rssUrl: string;
  orgSlug: string;
}

export function DirectorySubmissionBanner({ rssUrl, orgSlug }: Props) {
  const storageKey = `fp_onboarding_dismissed_${orgSlug}`;
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied]       = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDismissed(localStorage.getItem(storageKey) === "1");
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [storageKey]);

  if (dismissed) return null;

  function dismiss() {
    localStorage.setItem(storageKey, "1");
    setDismissed(true);
  }

  function copy() {
    navigator.clipboard.writeText(rssUrl);
    setCopied(true);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mb-8 border border-green-800/60 bg-green-950/30 p-5 relative">
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 text-ink-600 hover:text-ink-400 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <p className="text-[9px] uppercase tracking-[0.3em] text-green-400 font-bold mb-1">Your show is live!</p>
      <p className="text-sm font-bold text-ink-100 mb-3">
        Submit your RSS feed to podcast directories to start growing your audience.
      </p>

      {/* RSS URL copy field */}
      <div className="flex items-center gap-0 mb-4 border border-ink-800 bg-ink-950">
        <span className="flex-1 px-3 py-2 text-[11px] font-mono text-ink-400 truncate">{rssUrl}</span>
        <button
          onClick={copy}
          className="px-3 py-2 border-l border-ink-800 text-ink-500 hover:text-ink-200 hover:bg-ink-900 transition-colors shrink-0"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          { label: "Submit to Apple Podcasts", href: "https://podcastsconnect.apple.com" },
          { label: "Submit to Spotify",         href: "https://podcasters.spotify.com" },
          { label: "Submit to Amazon Music",    href: "https://podcasters.amazon.com" },
        ].map((dir) => (
          <a
            key={dir.label}
            href={dir.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-bold text-green-400 hover:text-green-300 transition-colors"
          >
            {dir.label}
            <ExternalLink className="h-3 w-3" />
          </a>
        ))}
      </div>
    </div>
  );
}
