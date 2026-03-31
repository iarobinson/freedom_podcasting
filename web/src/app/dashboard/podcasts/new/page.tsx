"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { podcastsApi, podcastImportsApi } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { toast } from "@/lib/toast";

const CATEGORIES = ["Arts","Business","Comedy","Education","Fiction","Government","Health & Fitness","History","Kids & Family","Leisure","Music","News","Religion & Spirituality","Science","Society & Culture","Sports","Technology","True Crime","TV & Film"];

type Mode = "scratch" | "import";

export default function NewPodcastPage() {
  const router = useRouter();
  const { currentOrg } = useAuthStore();
  const [mode, setMode] = useState<Mode>("scratch");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    title: "", description: "", author: "", email: "",
    slug: "", language: "en", category: "", explicit: false,
    podcast_type: "episodic", website_url: "",
  });
  const [rssUrl, setRssUrl] = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm((f) => ({ ...f, title, slug: autoSlug(title) }));
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
      const data = (err as { response?: { data?: { errors?: string[]; error?: string } } })?.response?.data;
      if (data?.errors) {
        setErrors({ _base: data.errors.join(", ") });
      } else if (data?.error) {
        toast.error("Plan limit reached", data.error);
        router.push("/dashboard/settings/billing");
      } else {
        toast.error("Failed to create podcast");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!currentOrg || !rssUrl.trim()) return;
    setLoading(true);
    try {
      const res = await podcastImportsApi.create(currentOrg.slug, rssUrl.trim());
      router.push(`/dashboard/podcasts/import/${res.data.data.id}`);
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: string; errors?: string[] } } })?.response?.data;
      if (data?.error) {
        toast.error("Plan limit reached", data.error);
        router.push("/dashboard/settings/billing");
      } else {
        toast.error("Import failed", data?.errors?.join(", ") ?? "Could not start the import. Check the URL and try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-300 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h1 className="font-display text-2xl text-ink-100 mb-1">New Podcast</h1>
      <p className="text-sm text-ink-500 mb-6">Set up your show — you can edit everything later</p>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setMode("scratch")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            mode === "scratch"
              ? "bg-brand-600 text-white"
              : "bg-white/5 text-ink-400 hover:text-ink-200"
          }`}
        >
          + Start from scratch
        </button>
        <button
          onClick={() => setMode("import")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            mode === "import"
              ? "bg-brand-600 text-white"
              : "bg-white/5 text-ink-400 hover:text-ink-200"
          }`}
        >
          <Download className="h-3.5 w-3.5" /> Import from RSS
        </button>
      </div>

      {mode === "import" ? (
        <div className="space-y-6">
          <div className="panel rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Import from RSS Feed</h2>
            <p className="text-sm text-ink-500">
              Paste your existing RSS feed URL. We&apos;ll copy your podcast metadata and all audio files to FreedomPodcasting — your original feed stays untouched.
            </p>
            <Input
              label="RSS Feed URL"
              type="url"
              placeholder="https://feeds.example.com/my-podcast"
              value={rssUrl}
              onChange={(e) => setRssUrl(e.target.value)}
            />
            <p className="text-xs text-ink-600">
              This may take several minutes for large catalogs. You&apos;ll see live progress after clicking Start Import.
            </p>
          </div>

          <div className="flex items-center gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button onClick={handleImport} loading={loading} disabled={!rssUrl.trim()}>
              Start Import
            </Button>
          </div>
        </div>
      ) : (
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
            <Input label="Website URL" type="text" placeholder="https://mypodcast.com" value={form.website_url} onChange={set("website_url")} onBlur={(e) => {
                const val = e.target.value.trim();
                if (val && !val.match(/^https?:\/\//)) {
                  setForm((f) => ({ ...f, website_url: `https://${val}` }));
                }
              }}
            />
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
      )}
    </div>
  );
}
