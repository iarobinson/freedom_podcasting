"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertTriangle, XCircle, Zap } from "lucide-react";

interface Check {
  id: string;
  category: string;
  name: string;
  status: "pass" | "warn" | "fail";
  message: string;
}

interface ValidationResult {
  summary: { passed: number; warned: number; failed: number; total: number };
  feedTitle?: string;
  feedDescription?: string;
  episodeCount?: number;
  responseTimeMs?: number;
  checks: Check[];
}

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

function CheckIcon({ status }: { status: Check["status"] }) {
  if (status === "pass") return <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "#5dbf72" }} />;
  if (status === "warn") return <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: "#c8a44a" }} />;
  return <XCircle className="h-4 w-4 shrink-0 text-accent" />;
}

function StatusBadge({ status }: { status: Check["status"] }) {
  const cls = status === "pass" ? "badge badge-success" : status === "warn" ? "badge badge-warning" : "badge badge-live";
  const label = status === "pass" ? "Pass" : status === "warn" ? "Warn" : "Fail";
  return <span className={cls}>{label}</span>;
}

export default function FeedValidatorTool() {
  const searchParams = useSearchParams();
  const prefilled = searchParams.get("url") ?? "";

  const [feedUrl, setFeedUrl] = useState(prefilled);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = useCallback(async (urlToValidate?: string) => {
    const target = urlToValidate ?? feedUrl;
    if (!target.trim()) return;
    setLoading(true);
    setResults(null);
    setError(null);
    try {
      const res = await fetch(`/api/tools/validate-feed?url=${encodeURIComponent(target.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Validation failed. Please try again.");
      } else {
        setResults(data);
      }
    } catch {
      setError("Network error — could not reach the validation service.");
    } finally {
      setLoading(false);
    }
  }, [feedUrl]);

  // Auto-run if URL was pre-filled via search param
  useEffect(() => {
    if (prefilled) {
      handleValidate(prefilled);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grouped = results ? groupBy(results.checks, (c) => c.category) : {};

  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <div className="max-w-2xl">
        <label className="block text-sm font-medium text-ink-300 mb-2">RSS Feed URL</label>
        <div className="flex gap-3">
          <input
            type="url"
            value={feedUrl}
            onChange={(e) => setFeedUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleValidate()}
            placeholder="https://api.freedompodcasting.com/feeds/your-feed-token"
            className="flex-1 panel rounded-sm px-4 py-3 text-sm text-ink-100 placeholder:text-ink-700 focus:outline-none focus:border-accent/50 transition-colors"
          />
          <button
            onClick={() => handleValidate()}
            disabled={loading || !feedUrl.trim()}
            className="px-5 py-3 rounded-sm font-medium text-sm text-ink-950 transition-opacity hover:opacity-90 disabled:opacity-40 shrink-0"
            style={{ background: "var(--accent)" }}
          >
            {loading ? "Checking…" : "Validate Feed"}
          </button>
        </div>
      </div>

      {/* Loading shimmer */}
      {loading && (
        <div className="mt-8 max-w-2xl space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="panel rounded-sm p-4 flex items-center gap-3">
              <div className="shimmer-bg h-4 w-4 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="shimmer-bg h-3 rounded w-1/3" />
                <div className="shimmer-bg h-3 rounded w-2/3" />
              </div>
              <div className="shimmer-bg h-5 w-10 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="mt-6 panel rounded-sm p-4 max-w-2xl" style={{ borderColor: "rgba(204,0,0,0.3)" }}>
          <p className="text-sm text-accent">{error}</p>
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <div className="mt-8 space-y-8">
          {/* Summary bar */}
          <div className="panel rounded-sm p-5 max-w-2xl">
            <div className="flex items-center gap-6 flex-wrap mb-4">
              <span className="text-sm font-medium" style={{ color: "#5dbf72" }}>
                {results.summary.passed} passed
              </span>
              <span className="text-sm font-medium" style={{ color: "#c8a44a" }}>
                {results.summary.warned} warnings
              </span>
              <span className="text-sm font-medium text-accent">
                {results.summary.failed} failed
              </span>
              <span className="text-xs text-ink-600">
                {results.summary.total} checks total
              </span>
            </div>
            {(results.feedTitle || results.episodeCount !== undefined || results.responseTimeMs !== undefined) && (
              <div className="border-t border-ink-800 pt-4 space-y-1.5">
                {results.feedTitle && (
                  <p className="text-xs text-ink-500">
                    <span className="text-ink-700 mr-2">Feed:</span>
                    <span className="text-ink-300">{results.feedTitle}</span>
                  </p>
                )}
                {results.episodeCount !== undefined && (
                  <p className="text-xs text-ink-500">
                    <span className="text-ink-700 mr-2">Episodes:</span>
                    {results.episodeCount}
                  </p>
                )}
                {results.responseTimeMs !== undefined && (
                  <p className="text-xs text-ink-500">
                    <span className="text-ink-700 mr-2">Response time:</span>
                    {results.responseTimeMs}ms
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Check groups */}
          {Object.entries(grouped).map(([category, checks]) => (
            <div key={category} className="max-w-2xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-ink-600 mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {checks.map((check) => (
                  <div key={check.id} className="panel rounded-sm px-4 py-3 flex items-start gap-3">
                    <CheckIcon status={check.status} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink-300 font-medium leading-snug">{check.name}</p>
                      <p className="text-xs text-ink-500 mt-0.5 leading-relaxed break-all">{check.message}</p>
                    </div>
                    <StatusBadge status={check.status} />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* CTA */}
          <div className="panel rounded-sm p-6 max-w-2xl text-center">
            <h3 className="font-display text-lg text-ink-50 mb-2">Ready to host this podcast?</h3>
            <p className="text-sm text-ink-500 mb-5">
              Import your RSS feed to FreedomPodcasting — we&apos;ll migrate all your episodes,
              artwork, and metadata automatically.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm font-medium text-sm text-ink-950 transition-opacity hover:opacity-90"
                style={{ background: "var(--accent)" }}
              >
                <Zap className="h-3.5 w-3.5" />
                Import this podcast free
              </Link>
              <Link
                href="/tools"
                className="text-sm text-ink-500 hover:text-ink-300 transition-colors"
              >
                ← View all tools
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
