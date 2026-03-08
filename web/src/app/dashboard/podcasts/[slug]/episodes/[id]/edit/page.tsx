"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Mic2, Clock, Sparkles } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { episodesApi } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { AudioUploader } from "@/components/upload/AudioUploader";
import { toast } from "@/lib/toast";
import type { Episode } from "@/types";

export default function EditEpisodePage() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { currentOrg } = useAuthStore();
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [replaceAudio, setReplaceAudio] = useState(false);

  const { data: episode } = useQuery<Episode>({
    queryKey: ["episode", currentOrg?.slug, slug, id],
    queryFn:  () => episodesApi.get(currentOrg!.slug, slug, parseInt(id)).then((r) => r.data.data),
    enabled:  !!currentOrg,
  });

  useEffect(() => {
    if (episode) setForm({
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
  }, [episode]);

  const generateShowNotes = useMutation({
    mutationFn: () => episodesApi.generateShowNotes(currentOrg!.slug, slug, parseInt(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["episode", currentOrg?.slug, slug, id] });
      toast.success("Show notes generating…", "This will take about 30 seconds.");
    },
    onError: () => toast.error("Failed to start show notes generation"),
  });

  // Poll while AI is generating (metadata or show notes)
  const isGeneratingMetadata  = episode?.ai_metadata_status === "pending" || episode?.ai_metadata_status === "processing";
  const isGeneratingShowNotes = episode?.show_notes_ai_status === "pending" || episode?.show_notes_ai_status === "processing";
  const isPolling = isGeneratingMetadata || isGeneratingShowNotes;
  useEffect(() => {
    if (!isPolling) return;
    const interval = setInterval(() => {
      qc.invalidateQueries({ queryKey: ["episode", currentOrg?.slug, slug, id] });
    }, 5000);
    return () => clearInterval(interval);
  }, [isPolling, qc, currentOrg?.slug, slug, id]);

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

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-300 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="font-display text-2xl text-ink-100 mb-1">Edit Episode</h1>
      <p className="text-sm text-ink-500 mb-8">{episode.title}</p>

      {isGeneratingMetadata && (
        <div className="flex items-start gap-3 rounded-sm border border-amber-500/30 bg-amber-500/8 px-4 py-3 mb-6">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-300">AI is generating your episode details…</p>
            <p className="text-xs text-amber-500 mt-0.5">Title, description, and summary will populate automatically once ready.</p>
          </div>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); update.mutate(); }} className="space-y-6">
        <div className="panel rounded-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Mic2 className="h-4 w-4 text-accent" />
            <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Audio File</h2>
          </div>
          {hasAudio && !replaceAudio && (
            <div className="rounded-sm border border-emerald-500/25 bg-emerald-500/8 p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-emerald-300">Audio attached</p>
                <div className="flex items-center gap-3 mt-0.5">
                  {episode.formatted_duration && (
                    <span className="text-xs text-emerald-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />{episode.formatted_duration}
                    </span>
                  )}
                  <span className="text-xs text-emerald-600 truncate">
                    {(form.audio_url as string).split("/").pop()}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReplaceAudio(true)}
                className="text-xs text-ink-600 hover:text-ink-400 transition-colors shrink-0">
                Replace
              </button>
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
          <Input label="Title" value={form.title as string ?? ""} onChange={set("title")} required />
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

      {episode.transcript && (
        <div className="panel rounded-sm p-6 space-y-3 mt-6">
          <div className="ornament-divider">
            <span>Transcript</span>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-ink-600">AI-generated · Whisper-1</p>
          <textarea
            readOnly
            value={episode.transcript}
            rows={12}
            className="w-full bg-ink-900 border border-ink-800 rounded-sm px-4 py-3 text-sm text-ink-300 leading-relaxed resize-y focus:outline-none"
          />
          <p className="text-[10px] text-ink-600 uppercase tracking-widest">Transcript editing available in a future update.</p>
        </div>
      )}

      {episode.transcript && (
        <div className="panel rounded-sm p-6 space-y-3 mt-4">
          <div className="ornament-divider">
            <span>Show Notes</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest text-ink-600">AI-generated · Claude</p>
            {(episode.show_notes_ai_status === "pending" || episode.show_notes_ai_status === "processing") ? (
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
          <p className="text-[10px] text-ink-600 uppercase tracking-widest">Show notes editing available in a future update.</p>
        </div>
      )}
    </div>
  );
}
