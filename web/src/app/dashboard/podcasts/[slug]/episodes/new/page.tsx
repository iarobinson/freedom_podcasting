"use client";
import { useCallback, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { episodesApi } from "@/lib/api";
import { AudioUploader } from "@/components/upload/AudioUploader";
import { Button } from "@/components/ui/Button";
import { toast } from "@/lib/toast";
import type { Episode } from "@/types";

function AiStep({ done, active, failed, label, hint }: {
  done: boolean; active: boolean; failed: boolean; label: string; hint: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {done ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
      ) : failed ? (
        <div className="h-3.5 w-3.5 rounded-full border-2 border-red-500/60 shrink-0" />
      ) : active ? (
        <Loader2 className="h-3.5 w-3.5 text-amber-400 animate-spin shrink-0" />
      ) : (
        <div className="h-3.5 w-3.5 rounded-full border border-ink-700 shrink-0" />
      )}
      <span className={done ? "text-emerald-400" : failed ? "text-red-400" : active ? "text-amber-200" : "text-ink-600"}>
        {label}
      </span>
      {active && <span className="text-ink-600">{hint}</span>}
      {failed && <span className="text-red-500">— failed, retrying…</span>}
    </div>
  );
}

export default function NewEpisodePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { currentOrg } = useAuthStore();
  const [episodeId, setEpisodeId] = useState<number | null>(null);
  const [uploadDone, setUploadDone] = useState(false);
  const [episode, setEpisode] = useState<Episode | null>(null);

  const handleFileSelected = useCallback(async () => {
    if (!currentOrg) return undefined;
    try {
      const res = await episodesApi.create(currentOrg.slug, slug, { episode_type: "full" });
      const id: number = res.data.data.id;
      setEpisodeId(id);
      return id;
    } catch {
      toast.error("Could not create episode", "Please try again.");
      return undefined;
    }
  }, [currentOrg, slug]);

  const handleUploadComplete = useCallback(() => {
    setUploadDone(true);
  }, []);

  // Poll episode until AI finishes (or gives up)
  useEffect(() => {
    if (!uploadDone || !episodeId || !currentOrg) return;

    const aiDone =
      episode?.ai_metadata_status === "done" ||
      episode?.ai_metadata_status === "failed" ||
      // No AI triggered (free plan) — treat as done after first fetch
      (episode != null &&
        episode.transcription_status == null &&
        episode.ai_metadata_status == null);

    if (aiDone) return;

    const fetch = async () => {
      try {
        const res = await episodesApi.get(currentOrg.slug, slug, episodeId);
        setEpisode(res.data.data);
      } catch {
        // ignore transient errors
      }
    };

    fetch();
    const interval = setInterval(fetch, 4000);
    return () => clearInterval(interval);
  }, [uploadDone, episodeId, currentOrg, slug, episode?.ai_metadata_status, episode?.transcription_status]);

  const isTranscribing       = episode?.transcription_status === "pending" || episode?.transcription_status === "processing";
  const isGeneratingMetadata = episode?.ai_metadata_status === "pending"   || episode?.ai_metadata_status === "processing";
  const isAiRunning          = isTranscribing || isGeneratingMetadata;
  const isAiDone             = episode?.ai_metadata_status === "done";
  const isAiFailed           = episode?.ai_metadata_status === "failed" || episode?.transcription_status === "failed";
  const noAiTriggered        = episode != null && episode.transcription_status == null && episode.ai_metadata_status == null;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-300 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to podcast
      </button>

      <h1 className="font-display text-2xl text-ink-100 mb-1">New Episode</h1>
      <p className="text-sm text-ink-500 mb-8">Upload your audio file to get started</p>

      {!uploadDone && (
        <div className="panel rounded-sm p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-accent" />
            <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Audio File</h2>
          </div>
          <p className="text-sm text-ink-500">
            Drop your audio file below. AI will automatically generate the title, description, and show notes from the transcript.
          </p>
          {currentOrg && (
            <AudioUploader
              orgSlug={currentOrg.slug}
              podcastSlug={slug}
              onFileSelected={handleFileSelected}
              onUploadComplete={handleUploadComplete}
              onError={(err) => toast.error("Upload failed", err)}
            />
          )}
        </div>
      )}

      {uploadDone && (
        <div className="panel rounded-sm p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">AI Processing</h2>
          </div>

          {isAiRunning && (
            <>
              <p className="text-sm text-ink-400">
                AI is preparing your episode. This usually takes 1–2 minutes depending on audio length.
              </p>
              <div className="space-y-2.5">
                <AiStep
                  done={episode?.transcription_status === "done" || !!episode?.transcript}
                  active={isTranscribing}
                  failed={episode?.transcription_status === "failed"}
                  label="Transcribing audio"
                  hint="~1 min per 10 min of audio"
                />
                {episode?.ai_metadata_status != null && (
                  <AiStep
                    done={episode.ai_metadata_status === "done"}
                    active={isGeneratingMetadata}
                    failed={episode.ai_metadata_status === "failed"}
                    label="Writing title & description"
                    hint="~15 seconds"
                  />
                )}
              </div>
            </>
          )}

          {isAiDone && (
            <div className="space-y-4">
              <div className="space-y-2.5">
                <AiStep done active={false} failed={false} label="Transcribing audio" hint="" />
                <AiStep done active={false} failed={false} label="Writing title & description" hint="" />
              </div>
              <p className="text-sm text-emerald-400">Your episode is ready to review.</p>
              <Button onClick={() => router.push(`/dashboard/podcasts/${slug}/episodes/${episodeId}/edit`)}>
                Review & Edit <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          )}

          {(isAiFailed || noAiTriggered) && (
            <div className="space-y-4">
              {isAiFailed && (
                <p className="text-sm text-amber-400">
                  AI processing encountered an issue — you can still edit the episode manually and the system will retry.
                </p>
              )}
              {noAiTriggered && (
                <p className="text-sm text-ink-400">
                  Your audio has been uploaded. Head to the edit page to add your episode details.
                </p>
              )}
              <Button onClick={() => router.push(`/dashboard/podcasts/${slug}/episodes/${episodeId}/edit`)}>
                Edit Episode <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          )}

          {/* Loading state before first fetch returns */}
          {!isAiRunning && !isAiDone && !isAiFailed && !noAiTriggered && (
            <div className="flex items-center gap-2 text-sm text-ink-500">
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              Starting AI processing…
            </div>
          )}
        </div>
      )}
    </div>
  );
}
