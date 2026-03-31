"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Mic2, Clock, Sparkles, CheckCircle2, Loader2,
  Copy, Check, Lightbulb, Scissors, Search,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { episodesApi } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { AudioUploader } from "@/components/upload/AudioUploader";
import { WaveformPlayer, parseChapters } from "@/components/ui/WaveformPlayer";
import { toast } from "@/lib/toast";
import type { Episode } from "@/types";

function AiStep({ done, active, failed, label, hint }: { done: boolean; active: boolean; failed: boolean; label: string; hint: string }) {
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

interface SocialClip { timestamp: string; quote: string; hook: string }

export default function EditEpisodePage() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const { currentOrg } = useAuthStore();
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [replaceAudio, setReplaceAudio] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  // 3.7 — SEO title suggestions
  const [suggestingTitles, setSuggestingTitles] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);

  // 3.8 — Social clip suggestions
  const [suggestingClips, setSuggestingClips] = useState(false);
  const [socialClips, setSocialClips] = useState<SocialClip[]>([]);
  const [copiedClipIdx, setCopiedClipIdx] = useState<number | null>(null);

  // 3.9 — Transcript editor
  const [transcriptDraft, setTranscriptDraft] = useState("");
  const [transcriptSearch, setTranscriptSearch] = useState("");
  const [savingTranscript, setSavingTranscript] = useState(false);
  const transcriptRef = useRef<HTMLTextAreaElement>(null);

  const handleCopyAudioUrl = () => {
    const url = form.audio_url as string;
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    });
  };

  const { data: episode } = useQuery<Episode>({
    queryKey: ["episode", currentOrg?.slug, slug, id],
    queryFn:  () => episodesApi.get(currentOrg!.slug, slug, parseInt(id)).then((r) => r.data.data),
    enabled:  !!currentOrg,
  });

  useEffect(() => {
    if (episode) {
      setForm({
        title:          episode.title,
        description:    episode.description,
        summary:        episode.summary ?? "",
        slug:           (episode as Episode & { slug?: string }).slug ?? "",
        episode_type:   episode.episode_type,
        episode_number: episode.episode_number ?? "",
        season_number:  episode.season_number ?? "",
        explicit:       episode.explicit,
        keywords:       episode.keywords ?? "",
        audio_url:      episode.audio_url ?? "",
      });
      // Sync transcript draft when episode loads (don't overwrite in-progress edits)
      setTranscriptDraft((prev) => prev || episode.transcript || "");
    }
  }, [episode]);

  // Show success toast when returning from Stripe and strip the param
  useEffect(() => {
    if (searchParams.get("ai_purchased") === "true") {
      toast.success("Payment confirmed!", "AI is processing your episode — this page will update automatically.");
      router.replace(`/dashboard/podcasts/${slug}/episodes/${id}/edit`);
    }
  }, []);

  const handleCheckoutAi = async () => {
    if (!currentOrg) return;
    setCheckingOut(true);
    try {
      const res = await episodesApi.checkoutAi(currentOrg.slug, slug, parseInt(id));
      window.location.href = res.data.url;
    } catch {
      toast.error("Could not start checkout", "Please try again in a moment.");
      setCheckingOut(false);
    }
  };

  // 3.7 — Suggest titles
  const handleSuggestTitles = async () => {
    if (!currentOrg) return;
    setSuggestingTitles(true);
    setTitleSuggestions([]);
    try {
      const res = await episodesApi.suggestTitles(currentOrg.slug, slug, parseInt(id));
      setTitleSuggestions(res.data.titles ?? []);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 402) {
        toast.error("Paid plan required", "Upgrade to Starter or higher to use AI title suggestions.");
      } else {
        toast.error("Could not generate title suggestions");
      }
    } finally {
      setSuggestingTitles(false);
    }
  };

  // 3.8 — Suggest clips
  const handleSuggestClips = async () => {
    if (!currentOrg) return;
    setSuggestingClips(true);
    setSocialClips([]);
    try {
      const res = await episodesApi.suggestClips(currentOrg.slug, slug, parseInt(id));
      setSocialClips(res.data.clips ?? []);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 402) {
        toast.error("Paid plan required", "Upgrade to Starter or higher to use AI clip suggestions.");
      } else {
        toast.error("Could not generate clip suggestions");
      }
    } finally {
      setSuggestingClips(false);
    }
  };

  const copyClip = (clip: SocialClip, idx: number) => {
    navigator.clipboard.writeText(`${clip.timestamp}\n\n"${clip.quote}"\n\n${clip.hook}`).then(() => {
      setCopiedClipIdx(idx);
      setTimeout(() => setCopiedClipIdx(null), 2000);
    });
  };

  // 3.9 — Transcript search
  const handleTranscriptSearch = (query: string) => {
    setTranscriptSearch(query);
    if (!query || !transcriptRef.current) return;
    const idx = transcriptDraft.toLowerCase().indexOf(query.toLowerCase());
    if (idx !== -1) {
      transcriptRef.current.focus();
      transcriptRef.current.setSelectionRange(idx, idx + query.length);
      const lineHeight = 20;
      const lines = transcriptDraft.substring(0, idx).split("\n").length;
      transcriptRef.current.scrollTop = lines * lineHeight;
    }
  };

  const handleSaveTranscript = async () => {
    if (!currentOrg) return;
    setSavingTranscript(true);
    try {
      await episodesApi.update(currentOrg.slug, slug, parseInt(id), { transcript: transcriptDraft });
      qc.invalidateQueries({ queryKey: ["episode", currentOrg.slug, slug, id] });
      toast.success("Transcript saved");
    } catch {
      toast.error("Failed to save transcript");
    } finally {
      setSavingTranscript(false);
    }
  };

  const generateShowNotes = useMutation({
    mutationFn: () => episodesApi.generateShowNotes(currentOrg!.slug, slug, parseInt(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["episode", currentOrg?.slug, slug, id] });
      toast.success("Show notes generating…", "This will take about 30 seconds.");
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 402) {
        toast.error("Paid plan required", "Upgrade to Starter or higher to use AI show notes.");
      } else {
        toast.error("Failed to start show notes generation");
      }
    },
  });

  // Poll while any AI step is in-flight
  const isTranscribing        = episode?.transcription_status === "pending" || episode?.transcription_status === "processing";
  const isGeneratingMetadata  = episode?.ai_metadata_status === "pending" || episode?.ai_metadata_status === "processing";
  const isGeneratingShowNotes = episode?.show_notes_ai_status === "pending" || episode?.show_notes_ai_status === "processing";
  const isAiRunning = isTranscribing || isGeneratingMetadata || isGeneratingShowNotes;
  useEffect(() => {
    if (!isAiRunning) return;
    const interval = setInterval(() => {
      qc.invalidateQueries({ queryKey: ["episode", currentOrg?.slug, slug, id] });
    }, 4000);
    return () => clearInterval(interval);
  }, [isAiRunning, qc, currentOrg?.slug, slug, id]);

  const update = useMutation({
    mutationFn: () => episodesApi.update(currentOrg!.slug, slug, parseInt(id), {
      ...form,
      slug: (form.slug as string)?.trim() || null,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["episodes", currentOrg?.slug, slug] });
      toast.success("Episode updated!");
      router.push(`/dashboard/podcasts/${slug}`);
    },
    onError: () => toast.error("Failed to update episode"),
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  if (!episode) return <div className="p-8"><div className="panel rounded-sm h-48 shimmer-bg" /></div>;

  const hasAudio = !!(form.audio_url as string);
  const showUploader = !hasAudio || replaceAudio;
  const isFreePlan = currentOrg?.plan === "free";
  const PRICE_PER_MIN = parseFloat(process.env.NEXT_PUBLIC_AI_PRICE_PER_MINUTE ?? "0.50");
  const calcAiPrice = (secs?: number) => {
    if (!secs) return "…";
    return `$${(Math.ceil(secs / 60) * PRICE_PER_MIN).toFixed(2)}`;
  };
  const transcriptChanged = transcriptDraft !== (episode?.transcript ?? "");

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-300 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="font-display text-2xl text-ink-100 mb-1">Edit Episode</h1>
      <p className="text-sm text-ink-500 mb-8">{episode.title}</p>

      {isAiRunning && (
        <div className="panel rounded-sm p-4 mb-6 border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-2 mb-3">
            <Loader2 className="h-4 w-4 text-amber-400 animate-spin shrink-0" />
            <p className="text-sm font-medium text-amber-300">
              {isTranscribing ? "Transcribing audio…" : isGeneratingMetadata ? "Generating episode details…" : "Generating show notes…"}
            </p>
          </div>
          <div className="space-y-2 pl-6">
            <AiStep
              done={episode.transcription_status === "done" || !!episode.transcript}
              active={isTranscribing}
              failed={episode.transcription_status === "failed"}
              label="Transcribing audio"
              hint="~1 min per 10 min of audio"
            />
            {episode.ai_metadata_status != null && (
              <AiStep
                done={episode.ai_metadata_status === "done"}
                active={isGeneratingMetadata}
                failed={episode.ai_metadata_status === "failed"}
                label="Writing title & description"
                hint="~15 seconds"
              />
            )}
            {episode.show_notes_ai_status != null && (
              <AiStep
                done={episode.show_notes_ai_status === "done"}
                active={isGeneratingShowNotes}
                failed={episode.show_notes_ai_status === "failed"}
                label="Writing show notes"
                hint="~30 seconds"
              />
            )}
          </div>
        </div>
      )}

      {isFreePlan && hasAudio && !episode.transcript && !episode.ai_purchased_at && (
        <div className="flex items-start gap-3 rounded-sm border border-ink-700 bg-ink-900 px-4 py-4 mb-6">
          <Sparkles className="h-4 w-4 text-accent shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink-200">Unlock AI for this episode</p>
            <p className="text-xs text-ink-500 mt-1 leading-relaxed">
              One-time charge: transcription + AI-generated title, description, and show notes.
              {episode.audio_duration_seconds
                ? <> Billed at $0.50/min · {Math.ceil(episode.audio_duration_seconds / 60)} min</>
                : null}
            </p>
          </div>
          <Button size="sm" onClick={handleCheckoutAi} loading={checkingOut}
            disabled={!episode.audio_duration_seconds}>
            Unlock — {calcAiPrice(episode.audio_duration_seconds)}
          </Button>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); update.mutate(); }} className="space-y-6">
        <div className="panel rounded-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Mic2 className="h-4 w-4 text-accent" />
            <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Audio File</h2>
          </div>
          {hasAudio && !replaceAudio && (
            <div className="rounded-sm border border-emerald-500/25 bg-emerald-500/8 p-4 space-y-3">
              {/* Waveform or fallback header */}
              {episode.waveform_peaks && episode.waveform_peaks.length > 0 ? (
                <WaveformPlayer
                  src={form.audio_url as string}
                  durationSecs={episode.audio_duration_seconds}
                  peaks={episode.waveform_peaks}
                  chapters={episode.transcript ? parseChapters(episode.transcript) : []}
                />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-emerald-300">Audio attached</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {episode.formatted_duration && (
                        <span className="text-xs text-emerald-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />{episode.formatted_duration}
                        </span>
                      )}
                      <span className="text-xs text-emerald-600 truncate">
                        {episode.audio_filename || (form.audio_url as string).split("/").pop()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {/* Replace + URL copy row */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 flex-1 rounded-sm border border-ink-700/60 bg-ink-900/60 px-2.5 py-1.5">
                  <span className="text-[11px] text-ink-500 font-mono truncate flex-1 select-all">
                    {form.audio_url as string}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAudioUrl}
                    title="Copy media URL"
                    className="shrink-0 text-ink-600 hover:text-ink-300 transition-colors">
                    {urlCopied
                      ? <Check className="h-3.5 w-3.5 text-emerald-400" />
                      : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setReplaceAudio(true)}
                  className="text-xs text-ink-600 hover:text-ink-400 transition-colors shrink-0">
                  Replace
                </button>
              </div>
            </div>
          )}
          {showUploader && currentOrg && (
            <AudioUploader
              orgSlug={currentOrg.slug}
              podcastSlug={slug}
              episodeId={parseInt(id)}
              onUploadComplete={(data) => {
                setForm((f) => ({ ...f, audio_url: data.publicUrl }));
                setReplaceAudio(false);
                toast.success("Audio uploaded!", "Metadata will be extracted in the background.");
              }}
              onError={(err) => toast.error("Upload failed", err)}
            />
          )}
        </div>

        <div className="panel rounded-sm p-6 space-y-4">
          <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Episode Details</h2>

          {/* Title with SEO suggestion button */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-widest text-ink-500">Title</label>
              {episode.transcript && (
                <button
                  type="button"
                  onClick={handleSuggestTitles}
                  disabled={suggestingTitles}
                  title="Suggest SEO titles"
                  className="flex items-center gap-1 text-[10px] text-ink-600 hover:text-accent transition-colors disabled:opacity-50">
                  {suggestingTitles
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Lightbulb className="h-3.5 w-3.5" />}
                  <span>{suggestingTitles ? "Thinking…" : "SEO titles"}</span>
                </button>
              )}
            </div>
            <Input value={form.title as string ?? ""} onChange={set("title")} required />
            {titleSuggestions.length > 0 && (
              <div className="flex flex-col gap-1.5 pt-1">
                {titleSuggestions.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, title: t }))}
                    className="text-xs px-2.5 py-1.5 rounded-sm panel text-ink-400 hover:text-ink-100 hover:border-accent/40 transition-colors text-left border border-transparent">
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Textarea label="Description" value={form.description as string ?? ""} onChange={set("description")} rows={5} required />
          <Textarea label="Summary" value={form.summary as string ?? ""} onChange={set("summary")} rows={2} />
        </div>

        <details className="group">
          <summary className="cursor-pointer text-xs text-ink-600 hover:text-ink-400 transition-colors uppercase tracking-widest select-none list-none flex items-center gap-1.5 mb-3">
            <span className="group-open:rotate-90 transition-transform inline-block">▶</span> Advanced settings
          </summary>
          <div className="panel rounded-sm p-6 space-y-4">
            <div className="space-y-1.5">
              <Input
                label="Custom URL slug"
                placeholder="my-episode-title (leave blank to use ID)"
                value={form.slug as string ?? ""}
                onChange={set("slug")}
                onBlur={() => setForm((f) => ({ ...f, slug: (f.slug as string).trim().toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "") }))}
              />
              <p className="text-xs text-ink-600">Leave blank to use the episode ID.</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-ink-300">Type</label>
                <select value={form.episode_type as string ?? "full"} onChange={set("episode_type")}
                  className="w-full rounded-sm px-3.5 py-2.5 text-sm bg-ink-800 border border-ink-700 text-ink-100 focus:outline-none focus:ring-2 focus:ring-accent/40">
                  <option value="full">Full</option>
                  <option value="trailer">Trailer</option>
                  <option value="bonus">Bonus</option>
                </select>
              </div>
              <Input label="Episode #" type="number" value={form.episode_number as string ?? ""} onChange={set("episode_number")} min="1" />
              <Input label="Season #"  type="number" value={form.season_number  as string ?? ""} onChange={set("season_number")}  min="1" />
            </div>
            <Input label="Keywords" value={form.keywords as string ?? ""} onChange={set("keywords")} placeholder="tech, business (comma-separated)" />
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.explicit as boolean ?? false}
                onChange={(e) => setForm((f) => ({ ...f, explicit: e.target.checked }))}
                className="w-4 h-4 rounded bg-ink-800 border border-ink-700" style={{ accentColor: "var(--accent)" }} />
              <span className="text-sm text-ink-400">Explicit content</span>
            </label>
          </div>
        </details>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={update.isPending}>Save Changes</Button>
        </div>
      </form>

      {/* 3.9 — Editable transcript */}
      {episode.transcript && (
        <div className="panel rounded-sm p-6 space-y-3 mt-6">
          <div className="ornament-divider">
            <span>Transcript</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] uppercase tracking-widest text-ink-600">AI-generated · Whisper-1</p>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-ink-600 pointer-events-none" />
                <input
                  value={transcriptSearch}
                  onChange={(e) => handleTranscriptSearch(e.target.value)}
                  placeholder="Search…"
                  className="pl-6 pr-2 py-1 text-xs bg-ink-900 border border-ink-700 text-ink-300 focus:border-accent focus:outline-none rounded-none w-32"
                />
              </div>
              {transcriptChanged && (
                <Button size="sm" onClick={handleSaveTranscript} loading={savingTranscript} type="button">
                  Save
                </Button>
              )}
            </div>
          </div>
          <textarea
            ref={transcriptRef}
            value={transcriptDraft}
            onChange={(e) => setTranscriptDraft(e.target.value)}
            rows={14}
            className="w-full px-3 py-2.5 text-xs font-mono bg-ink-900 border border-ink-700 text-ink-400 focus:border-accent focus:outline-none resize-y"
          />
        </div>
      )}

      {/* Show notes */}
      {episode.transcript && (
        <div className="panel rounded-sm p-6 space-y-3 mt-4">
          <div className="ornament-divider">
            <span>Show Notes</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest text-ink-600">AI-generated · Claude</p>
            {isFreePlan ? (
              <Link href="/dashboard/settings/billing" className="text-xs text-accent hover:text-accent-light transition-colors">
                Upgrade to regenerate
              </Link>
            ) : isGeneratingShowNotes ? (
              <span className="text-[10px] uppercase tracking-widest text-amber-500">Generating…</span>
            ) : (
              <button
                onClick={() => generateShowNotes.mutate()}
                disabled={generateShowNotes.isPending}
                className="text-xs text-ink-600 hover:text-accent transition-colors disabled:opacity-50">
                {episode.show_notes_ai ? "Regenerate" : "Generate"}
              </button>
            )}
          </div>
          {episode.show_notes_ai && (
            <textarea
              readOnly
              value={episode.show_notes_ai}
              rows={14}
              className="w-full bg-ink-900 border border-ink-800 rounded-sm px-4 py-3 text-sm text-ink-300 leading-relaxed resize-y focus:outline-none"
            />
          )}
          {!episode.show_notes_ai && !isFreePlan && (
            <p className="text-[10px] text-ink-600 uppercase tracking-widest">Click Generate to create AI show notes from your transcript.</p>
          )}
        </div>
      )}

      {/* 3.8 — Social clip suggestions */}
      {episode.transcript && (
        <div className="panel rounded-sm p-6 space-y-3 mt-4">
          <div className="ornament-divider">
            <span>Social Clips</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest text-ink-600">AI-generated · Claude</p>
            <button
              onClick={handleSuggestClips}
              disabled={suggestingClips}
              className="flex items-center gap-1.5 text-xs text-ink-600 hover:text-accent transition-colors disabled:opacity-50">
              {suggestingClips
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Scissors className="h-3.5 w-3.5" />}
              {suggestingClips ? "Finding clips…" : "Suggest Clips"}
            </button>
          </div>
          {socialClips.length > 0 && (
            <div className="space-y-3">
              {socialClips.map((clip, i) => (
                <div key={i} className="panel rounded-sm p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-accent">{clip.timestamp}</span>
                    <button
                      onClick={() => copyClip(clip, i)}
                      className="text-ink-600 hover:text-ink-300 transition-colors"
                      title="Copy clip">
                      {copiedClipIdx === i
                        ? <Check className="h-3.5 w-3.5 text-emerald-400" />
                        : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <p className="text-xs text-ink-300 leading-relaxed">&ldquo;{clip.quote}&rdquo;</p>
                  <p className="text-[11px] text-ink-600 italic">{clip.hook}</p>
                </div>
              ))}
            </div>
          )}
          {socialClips.length === 0 && !suggestingClips && (
            <p className="text-[10px] text-ink-600 uppercase tracking-widest">Click Suggest Clips to find shareable moments from your transcript.</p>
          )}
        </div>
      )}
    </div>
  );
}
