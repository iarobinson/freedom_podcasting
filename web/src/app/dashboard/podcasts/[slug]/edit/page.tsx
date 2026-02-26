"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { podcastsApi } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { toast } from "@/lib/toast";
import type { Podcast } from "@/types";

const CATEGORIES = ["Arts","Business","Comedy","Education","Fiction","Government","Health & Fitness","History","Kids & Family","Leisure","Music","News","Religion & Spirituality","Science","Society & Culture","Sports","Technology","True Crime","TV & Film"];

export default function EditPodcastPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { currentOrg } = useAuthStore();
  const [form, setForm] = useState<Record<string, unknown>>({});

  const { data: podcast } = useQuery<Podcast>({
    queryKey: ["podcast", currentOrg?.slug, slug],
    queryFn:  () => podcastsApi.get(currentOrg!.slug, slug).then((r) => r.data.data),
    enabled:  !!currentOrg,
  });

  useEffect(() => {
    if (podcast) setForm({
      title: podcast.title, description: podcast.description,
      author: podcast.author, email: podcast.email,
      language: podcast.language, category: podcast.category ?? "",
      explicit: podcast.explicit, podcast_type: podcast.podcast_type,
      website_url: podcast.website_url ?? "",
    });
  }, [podcast]);

  const update = useMutation({
    mutationFn: () => podcastsApi.update(currentOrg!.slug, slug, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["podcast", currentOrg?.slug, slug] });
      toast.success("Podcast updated!");
      router.push(`/dashboard/podcasts/${slug}`);
    },
    onError: () => toast.error("Failed to update podcast"),
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  if (!podcast) return <div className="p-8"><div className="glass rounded-2xl h-48 shimmer-bg" /></div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-300 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="font-display text-2xl text-ink-100 mb-1">Edit Podcast</h1>
      <p className="text-sm text-ink-500 mb-8">{podcast.title}</p>

      <form onSubmit={(e) => { e.preventDefault(); update.mutate(); }} className="space-y-6">
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Basic Info</h2>
          <Input label="Title *" value={form.title as string ?? ""} onChange={set("title")} required />
          <Textarea label="Description *" value={form.description as string ?? ""} onChange={set("description")} rows={4} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Author *" value={form.author as string ?? ""} onChange={set("author")} required />
            <Input label="Email *" type="email" value={form.email as string ?? ""} onChange={set("email")} required />
          </div>
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink-300">Category</label>
              <select value={form.category as string ?? ""} onChange={set("category")}
                className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 text-ink-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40">
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink-300">Type</label>
              <select value={form.podcast_type as string ?? "episodic"} onChange={set("podcast_type")}
                className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 text-ink-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40">
                <option value="episodic">Episodic</option>
                <option value="serial">Serial</option>
              </select>
            </div>
          </div>
          <Input label="Website URL" type="text" placeholder="https://mypodcast.com" value={form.website_url as string ?? ""} onChange={set("website_url")} onBlur={(e) => {
              const val = e.target.value.trim();
              if (val && !val.match(/^https?:\/\//)) {
                setForm((f) => ({ ...f, website_url: `https://${val}` }));
              }
            }}
          />
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
