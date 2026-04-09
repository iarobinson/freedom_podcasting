"use client";
import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, AlertTriangle, GitCompare, ChevronDown, ChevronUp } from "lucide-react";
import type { CompareResult, DiffLine } from "@/app/api/tools/compare-feeds/route";

const CONTEXT_LINES = 4;

// ── Hunk computation ──────────────────────────────────────────────────────
// Groups diff lines into hunks — sequences of changes with surrounding context.

interface Hunk {
  lines: Array<DiffLine & { lineA: number | null; lineB: number | null }>;
}

function buildHunks(diff: DiffLine[]): Hunk[] {
  // Assign line numbers
  let lineA = 1, lineB = 1;
  const numbered = diff.map((d) => {
    const la = d.type !== "added" ? lineA : null;
    const lb = d.type !== "removed" ? lineB : null;
    if (d.type !== "added") lineA++;
    if (d.type !== "removed") lineB++;
    return { ...d, lineA: la, lineB: lb };
  });

  // Find indices of changed lines
  const changedIdx = new Set<number>();
  numbered.forEach((d, i) => {
    if (d.type !== "same") {
      for (let c = Math.max(0, i - CONTEXT_LINES); c <= Math.min(numbered.length - 1, i + CONTEXT_LINES); c++) {
        changedIdx.add(c);
      }
    }
  });

  if (changedIdx.size === 0) return [];

  // Build contiguous ranges → hunks
  const sorted = [...changedIdx].sort((a, b) => a - b);
  const hunks: Hunk[] = [];
  let hunkStart = sorted[0];
  let prev = sorted[0];

  for (let k = 1; k <= sorted.length; k++) {
    const cur = sorted[k];
    if (cur === undefined || cur > prev + 1) {
      hunks.push({ lines: numbered.slice(hunkStart, prev + 1) });
      hunkStart = cur;
    }
    prev = cur;
  }
  return hunks;
}

// ── Diff viewer ──────────────────────────────────────────────────────────

function DiffViewer({ diff, truncated, urlA, urlB }: {
  diff: DiffLine[];
  truncated: boolean;
  urlA: string;
  urlB: string;
}) {
  const [showAll, setShowAll] = useState(false);

  const addedCount   = diff.filter((d) => d.type === "added").length;
  const removedCount = diff.filter((d) => d.type === "removed").length;

  // Assign line numbers once
  let lineA = 1, lineB = 1;
  const numbered = diff.map((d) => {
    const la = d.type !== "added" ? lineA : null;
    const lb = d.type !== "removed" ? lineB : null;
    if (d.type !== "added") lineA++;
    if (d.type !== "removed") lineB++;
    return { ...d, lineA: la, lineB: lb };
  });

  const hunks = buildHunks(diff);
  const hasChanges = addedCount > 0 || removedCount > 0;

  return (
    <div className="space-y-3">
      {/* Stats bar */}
      <div className="flex items-center gap-4 text-xs">
        <span className="font-mono" style={{ color: "#4ade80" }}>+{addedCount} added</span>
        <span className="font-mono" style={{ color: "#f87171" }}>-{removedCount} removed</span>
        {truncated && (
          <span className="text-yellow-400">⚠ Feed too large — showing first 3,000 lines</span>
        )}
        {hasChanges && (
          <button
            onClick={() => setShowAll((s) => !s)}
            className="ml-auto flex items-center gap-1 text-ink-400 hover:text-ink-200 transition-colors"
          >
            {showAll ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showAll ? "Collapse unchanged lines" : "Show all lines"}
          </button>
        )}
      </div>

      {/* File headers */}
      <div className="rounded-sm overflow-hidden border border-ink-700 font-mono text-xs">
        <div className="grid grid-cols-2 border-b border-ink-700">
          <div className="px-4 py-2 bg-ink-800 text-ink-400 truncate">
            <span className="text-red-400 mr-2">a</span>{urlA}
          </div>
          <div className="px-4 py-2 bg-ink-800 text-ink-400 truncate border-l border-ink-700">
            <span className="text-green-400 mr-2">b</span>{urlB}
          </div>
        </div>

        {/* Diff lines */}
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto bg-ink-950">
          {!hasChanges ? (
            <div className="px-4 py-6 text-center text-ink-500">No text differences found.</div>
          ) : showAll ? (
            // All lines
            numbered.map((line, i) => <DiffRow key={i} line={line} />)
          ) : (
            // Hunks only
            hunks.length === 0 ? (
              <div className="px-4 py-6 text-center text-ink-500">No differences to show.</div>
            ) : (
              hunks.map((hunk, hi) => (
                <div key={hi}>
                  {/* Hunk separator */}
                  <div className="px-4 py-1 text-[10px] text-ink-600 bg-ink-900 border-y border-ink-800">
                    @@ hunk {hi + 1}
                  </div>
                  {hunk.lines.map((line, i) => <DiffRow key={i} line={line} />)}
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}

function DiffRow({ line }: {
  line: DiffLine & { lineA: number | null; lineB: number | null };
}) {
  const bg =
    line.type === "added"   ? "rgba(74,222,128,0.08)"  :
    line.type === "removed" ? "rgba(248,113,113,0.08)" :
    "transparent";

  const borderColor =
    line.type === "added"   ? "rgba(74,222,128,0.5)"  :
    line.type === "removed" ? "rgba(248,113,113,0.5)" :
    "transparent";

  const prefix =
    line.type === "added"   ? "+" :
    line.type === "removed" ? "-" :
    " ";

  const prefixColor =
    line.type === "added"   ? "#4ade80" :
    line.type === "removed" ? "#f87171" :
    "#3a3834";

  return (
    <div
      className="flex items-stretch min-w-0"
      style={{ background: bg, borderLeft: `2px solid ${borderColor}` }}
    >
      {/* Line numbers */}
      <div className="flex shrink-0 select-none">
        <span className="w-12 px-2 py-0.5 text-right text-[10px] border-r border-ink-800 select-none" style={{ color: "#3a3834" }}>
          {line.lineA ?? ""}
        </span>
        <span className="w-12 px-2 py-0.5 text-right text-[10px] border-r border-ink-800 select-none" style={{ color: "#3a3834" }}>
          {line.lineB ?? ""}
        </span>
      </div>
      {/* Prefix */}
      <span className="w-5 shrink-0 text-center py-0.5 text-[11px] select-none" style={{ color: prefixColor }}>
        {prefix}
      </span>
      {/* Content */}
      <span className="py-0.5 px-2 whitespace-pre text-[11px] text-ink-300 flex-1 min-w-0">
        {line.content}
      </span>
    </div>
  );
}

// ── Main tool ─────────────────────────────────────────────────────────────

export default function FeedComparatorTool() {
  const params = useSearchParams();
  const [urlA, setUrlA] = useState(params.get("a") ?? "");
  const [urlB, setUrlB] = useState(params.get("b") ?? "");
  const [result, setResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compare = useCallback(async () => {
    if (!urlA.trim() || !urlB.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(
        `/api/tools/compare-feeds?a=${encodeURIComponent(urlA.trim())}&b=${encodeURIComponent(urlB.trim())}`
      );
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Comparison failed");
    } finally {
      setLoading(false);
    }
  }, [urlA, urlB]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      {/* Inputs */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-ink-500">
            Original Feed URL
          </label>
          <input
            type="url"
            value={urlA}
            onChange={(e) => setUrlA(e.target.value)}
            placeholder="https://feeds.buzzsprout.com/your-feed.rss"
            className="w-full bg-ink-900 border border-ink-700 rounded-sm px-4 py-2.5 text-sm text-ink-200 placeholder-ink-700 focus:border-accent focus:outline-none font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-ink-500">
            New Feed URL
          </label>
          <input
            type="url"
            value={urlB}
            onChange={(e) => setUrlB(e.target.value)}
            placeholder="https://api.freedompodcasting.com/feeds/..."
            className="w-full bg-ink-900 border border-ink-700 rounded-sm px-4 py-2.5 text-sm text-ink-200 placeholder-ink-700 focus:border-accent focus:outline-none font-mono"
          />
        </div>
      </div>

      <button
        onClick={compare}
        disabled={loading || !urlA.trim() || !urlB.trim()}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-sm text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        style={{ background: "var(--accent)" }}
      >
        <GitCompare className="h-4 w-4" />
        {loading ? "Comparing…" : "Compare Feeds"}
      </button>

      {error && (
        <div className="panel rounded-sm p-4 border-red-800 text-red-400 text-sm flex items-start gap-2">
          <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Feed error banners */}
          {(result.feedA.error || result.feedB.error) && (
            <div className="space-y-2">
              {result.feedA.error && (
                <div className="panel rounded-sm p-4 border-red-800/50 text-sm text-red-400 flex items-start gap-2">
                  <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  Original feed error: {result.feedA.error}
                </div>
              )}
              {result.feedB.error && (
                <div className="panel rounded-sm p-4 border-red-800/50 text-sm text-red-400 flex items-start gap-2">
                  <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  New feed error: {result.feedB.error}
                </div>
              )}
            </div>
          )}

          {/* Semantic verdict */}
          {!result.feedA.error && !result.feedB.error && (
            <div
              className="rounded-sm p-5 flex items-start gap-3 border"
              style={
                result.semanticallySame
                  ? { background: "rgba(74,222,128,0.06)", borderColor: "rgba(74,222,128,0.3)" }
                  : { background: "rgba(251,191,36,0.06)", borderColor: "rgba(251,191,36,0.3)" }
              }
            >
              {result.semanticallySame ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#4ade80" }} />
              ) : (
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#fbbf24" }} />
              )}
              <div className="space-y-1.5">
                <p className="font-bold text-sm" style={{ color: result.semanticallySame ? "#4ade80" : "#fbbf24" }}>
                  {result.exactlySame
                    ? "These are the same feeds."
                    : result.semanticallySame
                    ? "These feeds are technically the same."
                    : "These feeds have semantic differences."}
                </p>
                {result.semanticNotes.map((note, i) => (
                  <p key={i} className="text-xs text-ink-400">{note}</p>
                ))}
                {!result.exactlySame && result.semanticallySame && (
                  <p className="text-xs text-ink-500">
                    Same episode count, GUIDs, and channel title. Audio URLs may differ — that is expected after migration.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Summary cards */}
          {!result.feedA.error && !result.feedB.error && (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Original Feed", meta: result.feedA, url: urlA },
                { label: "New Feed", meta: result.feedB, url: urlB },
              ].map(({ label, meta, url }) => (
                <div key={label} className="panel rounded-sm p-4 space-y-1">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-ink-600">{label}</p>
                  <p className="text-sm font-bold text-ink-100 truncate">{meta.title || "(no title)"}</p>
                  <p className="text-xs text-ink-500">{meta.episodeCount} episode{meta.episodeCount !== 1 ? "s" : ""}</p>
                  <p className="text-[10px] text-ink-700 font-mono truncate">{url}</p>
                </div>
              ))}
            </div>
          )}

          {/* Diff viewer */}
          {result.diff.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink-500">
                Raw XML Diff
              </h2>
              <p className="text-xs text-ink-600">
                Whitespace-normalized. Audio URLs changing from the original host to the FP CDN is expected and not a concern.
              </p>
              <DiffViewer
                diff={result.diff}
                truncated={result.truncated}
                urlA={urlA}
                urlB={urlB}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
