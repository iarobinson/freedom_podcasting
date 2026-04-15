"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, Loader2, XCircle, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { podcastImportsApi } from "@/lib/api";
import { PodcastImport } from "@/types";
import { Button } from "@/components/ui/Button";

export default function ImportStatusPage() {
  const { import_id } = useParams<{ import_id: string }>();
  const router = useRouter();
  const { currentOrg } = useAuthStore();
  const [imp, setImp] = useState<PodcastImport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = async () => {
    if (!currentOrg) return;
    try {
      const res = await podcastImportsApi.get(currentOrg.slug, Number(import_id));
      const data: PodcastImport = res.data.data;
      setImp(data);
      if (data.status === "done" || data.status === "failed") {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    } catch {
      setError("Could not load import status.");
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    fetchStatus();
    intervalRef.current = setInterval(fetchStatus, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrg, import_id]);

  const processed = imp ? imp.imported_episodes + imp.skipped_episodes : 0;
  const pct = imp && imp.total_episodes > 0
    ? Math.round((processed / imp.total_episodes) * 100)
    : 0;

  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto">
        <div className="panel rounded-2xl p-8 text-center space-y-4">
          <XCircle className="h-10 w-10 text-red-400 mx-auto" />
          <p className="text-ink-300">{error}</p>
          <Button variant="secondary" onClick={() => router.push("/dashboard/podcasts/new")}>
            Back to New Podcast
          </Button>
        </div>
      </div>
    );
  }

  if (!imp) {
    return (
      <div className="p-8 max-w-xl mx-auto flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-500" />
      </div>
    );
  }

  if (imp.status === "failed") {
    return (
      <div className="p-8 max-w-xl mx-auto">
        <div className="panel rounded-2xl p-8 space-y-6">
          <div className="flex items-center gap-3">
            <XCircle className="h-7 w-7 text-red-400 flex-shrink-0" />
            <div>
              <h1 className="font-display text-xl text-ink-100">Import failed</h1>
              <p className="text-sm text-ink-500 mt-0.5">Something went wrong while importing your podcast.</p>
            </div>
          </div>
          {imp.error_message && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 font-mono">
              {imp.error_message}
            </div>
          )}
          <Button variant="secondary" onClick={() => router.push("/dashboard/podcasts/new")}>
            Back to New Podcast
          </Button>
        </div>
      </div>
    );
  }

  if (imp.status === "done") {
    const allSkipped = imp.imported_episodes === 0 && imp.skipped_episodes > 0;
    const someSkipped = imp.skipped_episodes > 0 && imp.imported_episodes > 0;
    return (
      <div className="p-8 max-w-xl mx-auto">
        <div className="panel rounded-2xl p-8 space-y-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-7 w-7 text-green-400 flex-shrink-0" />
            <div>
              <h1 className="font-display text-xl text-ink-100">Import complete!</h1>
              <p className="text-sm text-ink-500 mt-0.5">
                {imp.imported_episodes > 0
                  ? `${imp.imported_episodes} episode${imp.imported_episodes !== 1 ? "s" : ""} imported successfully.`
                  : "Podcast created — no episodes were imported."}
              </p>
            </div>
          </div>

          {/* Skipped episodes breakdown */}
          {imp.skipped_episodes > 0 && (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 space-y-2">
              <p className="text-sm font-semibold text-yellow-300">
                {imp.skipped_episodes} episode{imp.skipped_episodes !== 1 ? "s" : ""} skipped
              </p>
              <p className="text-xs text-yellow-500/80 leading-relaxed">
                Episodes are skipped when they have no audio file in the feed, or when the source audio URL returned a 404. This is common with older WordPress-based podcasts where posts were added to the RSS feed without audio attached.
              </p>
              {allSkipped && (
                <p className="text-xs text-yellow-500/80 leading-relaxed">
                  If you have the original audio files, you can create episodes manually and upload them directly.
                </p>
              )}
            </div>
          )}

          {/* Stats row */}
          {imp.total_episodes > 0 && (
            <div className="grid grid-cols-3 gap-px bg-ink-800 border border-ink-800">
              {[
                { label: "Total in feed", value: imp.total_episodes },
                { label: "Imported",      value: imp.imported_episodes },
                { label: "Skipped",       value: imp.skipped_episodes },
              ].map(({ label, value }) => (
                <div key={label} className="bg-ink-950 px-4 py-3 text-center">
                  <p className="text-lg font-bold text-ink-100">{value}</p>
                  <p className="text-[9px] uppercase tracking-widest text-ink-600 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          )}

          {someSkipped && imp.imported_episodes > 0 && (
            <p className="text-sm text-ink-500">
              Imported audio is hosted on our CDN. Waveforms and durations will finish processing in the background.
            </p>
          )}
          {!someSkipped && imp.imported_episodes > 0 && (
            <p className="text-sm text-ink-500">
              Audio is hosted on our CDN. Waveforms and durations will finish processing in the background.
            </p>
          )}

          {imp.podcast_slug && (
            <Button onClick={() => router.push(`/dashboard/podcasts/${imp.podcast_slug}`)}>
              View Podcast <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // pending or processing
  return (
    <div className="p-8 max-w-xl mx-auto">
      <div className="panel rounded-2xl p-8 space-y-6">
        <div>
          <h1 className="font-display text-xl text-ink-100">Importing your podcast…</h1>
          <p className="text-sm text-ink-500 mt-1">{imp.rss_url}</p>
        </div>

        <div className="space-y-3">
          {/* Step 1: Podcast created */}
          <div className="flex items-center gap-3">
            {imp.podcast_id ? (
              <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
            ) : (
              <Loader2 className="h-5 w-5 animate-spin text-ink-500 flex-shrink-0" />
            )}
            <span className={`text-sm ${imp.podcast_id ? "text-ink-300" : "text-ink-500"}`}>
              Reading feed &amp; creating podcast
            </span>
          </div>

          {/* Step 2: Episodes */}
          {imp.podcast_id && (
            <div className="flex items-center gap-3">
              {imp.total_episodes > 0 && processed >= imp.total_episodes ? (
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
              ) : (
                <Loader2 className="h-5 w-5 animate-spin text-brand-400 flex-shrink-0" />
              )}
              <span className="text-sm text-ink-300">
                {imp.total_episodes > 0
                  ? `Downloading episodes — ${processed} of ${imp.total_episodes}`
                  : "Downloading episodes…"}
              </span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {imp.podcast_id && imp.total_episodes > 0 && (
          <div className="space-y-1.5">
            <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-brand-500 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-ink-600 text-right">{pct}%</p>
          </div>
        )}

        <p className="text-xs text-ink-600">
          This page updates automatically. Large catalogs may take several minutes — you can safely navigate away and come back.
        </p>
      </div>
    </div>
  );
}
