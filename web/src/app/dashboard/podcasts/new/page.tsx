"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { podcastsApi } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { toast } from "@/lib/toast";

const CATEGORIES = ["Arts","Business","Comedy","Education","Fiction","Government","Health & Fitness","History","Kids & Family","Leisure","Music","News","Religion & Spirituality","Science","Society & Culture","Sports","Technology","True Crime","TV & Film"];

export default function NewPodcastPage() {
  const router = useRouter();
  const { currentOrg } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    title: "", description: "", author: "", email: "",
    slug: "", language: "en", category: "", explicit: false,
    podcast_type: "episodic", website_url: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm((f) => ({ ...f, title, slug: f.slug || autoSlug(title) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg) return;
    setLoading(true);
    setErrors({});
    try {
      const res = await podcastsApi.create(currentOrg.slug, form);
      toast.success("Podcast created!", "Your RSS feed is ready.");
      router.push(`/dashboard/podcasts/${res.data.data.slug}`);
    } catch (err: unknown) {
      const errs = (err as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors;
      if (errs) setErrors({ _base: errs.join(", ") });
      else toast.error("Failed to create podcast");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-300 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h1 className="font-display text-2xl text-ink-100 mb-1">New Podcast</h1>
      <p className="text-sm text-ink-500 mb-8">Set up your show — you can edit everything later</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Basic Info</h2>
          <Input label="Podcast title *" placeholder="My Awesome Podcast" value={form.title} onChange={handleTitleChange} required />
          <Textarea label="Description *" placeholder="Tell listeners what your show is about..." value={form.description} onChange={set("description")} rows={4} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Author / Host *" placeholder="Jane Doe" value={form.author} onChange={set("author")} required />
            <Input label="Contact email *" type="email" placeholder="host@example.com" value={form.email} onChange={set("email")} required />
          </div>
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">RSS Settings</h2>
          <Input label="URL slug *" placeholder="my-awesome-podcast" value={form.slug} onChange={set("slug")} required
            hint="This forms your RSS feed URL: feeds/my-awesome-podcast" />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink-300">Category</label>
              <select value={form.category} onChange={set("category")}
                className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 text-ink-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40">
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink-300">Type</label>
              <select value={form.podcast_type} onChange={set("podcast_type")}
                className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 text-ink-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40">
                <option value="episodic">Episodic</option>
                <option value="serial">Serial</option>
              </select>
            </div>
          </div>
          <Input label="Website URL" type="url" placeholder="https://mypodcast.com" value={form.website_url} onChange={set("website_url")} />
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input type="checkbox" checked={form.explicit} onChange={(e) => setForm((f) => ({ ...f, explicit: e.target.checked }))}
              className="w-4 h-4 rounded bg-white/5 border border-white/10 accent-brand-500" />
            <span className="text-sm text-ink-400 group-hover:text-ink-300 transition-colors">Explicit content</span>
          </label>
        </div>

        {errors._base && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{errors._base}</div>
        )}

        <div className="flex items-center gap-3 justify-end">
          <Button variant="secondary" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={loading}>Create Podcast</Button>
        </div>
      </form>
    </div>
  );
}
