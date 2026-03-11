"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { podcastsApi } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { ArtworkUploader } from "@/components/upload/ArtworkUploader";
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
      artwork_url: podcast.artwork_url ?? "",
      slug: podcast.slug,
      apple_podcasts_url: podcast.apple_podcasts_url ?? "",
      spotify_url: podcast.spotify_url ?? "",
      amazon_music_url: podcast.amazon_music_url ?? "",
    });
  }, [podcast]);

  const update = useMutation({
    mutationFn: () => podcastsApi.update(currentOrg!.slug, slug, form),
    onSuccess: () => {
      const newSlug = (form.slug as string) || slug;
      qc.invalidateQueries({ queryKey: ["podcast", currentOrg?.slug, slug] });
      qc.invalidateQueries({ queryKey: ["podcast", currentOrg?.slug, newSlug] });
      toast.success("Podcast updated!");
      router.push(`/dashboard/podcasts/${newSlug}`);
    },
    onError: (err: unknown) => {
      const msgs = (err as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors;
      toast.error("Failed to update podcast", msgs?.join(", ") ?? "Something went wrong.");
    },
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
          <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Artwork</h2>
          <ArtworkUploader
            orgSlug={currentOrg!.slug}
            podcastSlug={slug}
            currentUrl={form.artwork_url as string | null}
            onUploadComplete={(url) => setForm((f) => ({ ...f, artwork_url: url }))}
            onError={(msg) => toast.error(msg)}
          />
        </div>

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

          <div className="pt-2 border-t border-white/5 space-y-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink-300">Podcast URL slug</label>
              <div className="flex items-stretch">
                <span className="flex items-center px-3 text-xs text-ink-600 bg-ink-900 border border-r-0 border-ink-700 rounded-l-sm whitespace-nowrap select-none">
                  /rss/
                </span>
                <input
                  type="text"
                  value={form.slug as string ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
                    setForm((f) => ({ ...f, slug: raw }));
                  }}
                  onBlur={(e) => {
                    setForm((f) => ({ ...f, slug: e.target.value.replace(/^-+|-+$/g, "") }));
                  }}
                  className="flex-1 px-3 py-2.5 text-sm bg-white/5 border border-ink-700 rounded-r-sm text-ink-100 focus:outline-none focus:ring-2 focus:ring-accent/40"
                  placeholder="my-podcast"
                />
              </div>
              <p className="text-xs text-ink-600">
                RSS feed: <span className="text-ink-500 font-mono">{podcast.rss_url.replace(`/${podcast.slug}`, `/${(form.slug as string) || podcast.slug}`)}</span>
              </p>
            </div>

            {(form.slug as string) && (form.slug as string) !== podcast.slug && (
              <div className="flex items-start gap-3 rounded-sm border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-300">Changing this URL will break your RSS feed</p>
                  <p className="text-xs text-amber-500 mt-1 leading-relaxed">
                    If you&apos;ve already submitted this podcast to Apple Podcasts, Spotify, or other directories,
                    they will continue pointing to the old URL. Subscribers may lose access to new episodes until
                    each directory is manually updated with the new RSS feed URL.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1">Podcast Directories</h2>
            <p className="text-xs text-ink-600">After your podcast is approved on each platform, paste the URL here to show subscribe buttons on your public podcast page.</p>
          </div>
          <Input
            label="Apple Podcasts URL"
            type="url"
            placeholder="https://podcasts.apple.com/podcast/id..."
            value={form.apple_podcasts_url as string ?? ""}
            onChange={set("apple_podcasts_url")}
          />
          <Input
            label="Spotify URL"
            type="url"
            placeholder="https://open.spotify.com/show/..."
            value={form.spotify_url as string ?? ""}
            onChange={set("spotify_url")}
          />
          <Input
            label="Amazon Music URL"
            type="url"
            placeholder="https://music.amazon.com/podcasts/..."
            value={form.amazon_music_url as string ?? ""}
            onChange={set("amazon_music_url")}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={update.isPending}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
