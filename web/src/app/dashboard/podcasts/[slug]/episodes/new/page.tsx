"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Mic2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { episodesApi, uploadsApi } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { AudioUploader } from "@/components/upload/AudioUploader";
import { toast } from "@/lib/toast";

export default function NewEpisodePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { currentOrg } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [audioData, setAudioData] = useState<{ mediaFileId: number; publicUrl: string } | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", summary: "",
    episode_type: "full", explicit: false, keywords: "",
    episode_number: "", season_number: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        audio_url: audioData?.publicUrl ?? null,
        episode_number: form.episode_number ? parseInt(form.episode_number) : null,
        season_number:  form.season_number  ? parseInt(form.season_number)  : null,
      };
      await episodesApi.create(currentOrg.slug, slug, payload);
      toast.success("Episode created!", audioData ? "Audio attached successfully." : "Add audio when ready.");
      router.push(`/dashboard/podcasts/${slug}`);
    } catch {
      toast.error("Failed to create episode");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-300 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to podcast
      </button>

      <h1 className="font-display text-2xl text-ink-100 mb-1">New Episode</h1>
      <p className="text-sm text-ink-500 mb-8">Upload your audio and fill in the details</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Audio upload */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Mic2 className="h-4 w-4 text-brand-400" />
            <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Audio File</h2>
          </div>
          {currentOrg && (
            <AudioUploader
              orgSlug={currentOrg.slug}
              podcastSlug={slug}
              onUploadComplete={(data) => {
                setAudioData(data);
                toast.success("Audio uploaded!", "Metadata will be extracted in the background.");
              }}
              onError={(err) => toast.error("Upload failed", err)}
            />
          )}
        </div>

        {/* Episode details */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Episode Details</h2>
          <Input label="Title *" placeholder="Episode title" value={form.title} onChange={set("title")} required />
          <Textarea label="Description / Show Notes *" placeholder="What's this episode about? Markdown supported." value={form.description} onChange={set("description")} rows={5} required />
          <Textarea label="Summary" placeholder="Short plain-text summary (shown in podcast apps)" value={form.summary} onChange={set("summary")} rows={2} />
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink-300">Type</label>
              <select value={form.episode_type} onChange={set("episode_type")}
                className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 text-ink-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40">
                <option value="full">Full</option>
                <option value="trailer">Trailer</option>
                <option value="bonus">Bonus</option>
              </select>
            </div>
            <Input label="Episode #" type="number" placeholder="1" value={form.episode_number} onChange={set("episode_number")} min="1" />
            <Input label="Season #"  type="number" placeholder="1" value={form.season_number}  onChange={set("season_number")}  min="1" />
          </div>
          <Input label="Keywords" placeholder="tech, business, startup (comma-separated)" value={form.keywords} onChange={set("keywords")} />
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input type="checkbox" checked={form.explicit} onChange={(e) => setForm((f) => ({ ...f, explicit: e.target.checked }))}
              className="w-4 h-4 rounded bg-white/5 border border-white/10 accent-brand-500" />
            <span className="text-sm text-ink-400 group-hover:text-ink-300 transition-colors">Explicit content</span>
          </label>
        </div>

        <div className="flex items-center gap-3 justify-end">
          <Button variant="secondary" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={loading}>Save Episode</Button>
        </div>
      </form>
    </div>
  );
}
