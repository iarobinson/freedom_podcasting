"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { episodesApi } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { toast } from "@/lib/toast";
import type { Episode } from "@/types";

export default function EditEpisodePage() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { currentOrg } = useAuthStore();
  const [form, setForm] = useState<Record<string, unknown>>({});

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
      episode_type:   episode.episode_type,
      episode_number: episode.episode_number ?? "",
      season_number:  episode.season_number ?? "",
      explicit:       episode.explicit,
      keywords:       episode.keywords ?? "",
    });
  }, [episode]);

  const update = useMutation({
    mutationFn: () => episodesApi.update(currentOrg!.slug, slug, parseInt(id), form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["episodes", currentOrg?.slug, slug] });
      toast.success("Episode updated!");
      router.push(`/dashboard/podcasts/${slug}`);
    },
    onError: () => toast.error("Failed to update episode"),
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  if (!episode) return <div className="p-8"><div className="glass rounded-2xl h-48 shimmer-bg" /></div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-300 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="font-display text-2xl text-ink-100 mb-1">Edit Episode</h1>
      <p className="text-sm text-ink-500 mb-8">{episode.title}</p>

      <form onSubmit={(e) => { e.preventDefault(); update.mutate(); }} className="space-y-6">
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Episode Details</h2>
          <Input label="Title *" value={form.title as string ?? ""} onChange={set("title")} required />
          <Textarea label="Description *" value={form.description as string ?? ""} onChange={set("description")} rows={5} required />
          <Textarea label="Summary" value={form.summary as string ?? ""} onChange={set("summary")} rows={2} />
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink-300">Type</label>
              <select value={form.episode_type as string ?? "full"} onChange={set("episode_type")}
                className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 text-ink-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40">
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
              className="w-4 h-4 rounded accent-brand-500" />
            <span className="text-sm text-ink-400">Explicit content</span>
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={update.isPending}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
