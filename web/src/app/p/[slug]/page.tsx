import { Mic2, Rss, ExternalLink, Clock } from "lucide-react";
import type { Metadata } from "next";
import { AudioPlayer } from "@/components/ui/AudioPlayer";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

async function getPodcast(slug: string) {
  const res = await fetch(`${API}/public/podcasts/${slug}`, { next: { revalidate: 300 } });
  if (!res.ok) return null;
  return res.json().then((d) => d.data);
}

async function getEpisodes(slug: string) {
  const res = await fetch(`${API}/public/podcasts/${slug}/episodes`, { next: { revalidate: 300 } });
  if (!res.ok) return [];
  return res.json().then((d) => d.data ?? []);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const podcast = await getPodcast(params.slug);
  if (!podcast) return { title: "Podcast Not Found" };
  return {
    title: podcast.title,
    description: podcast.description,
    openGraph: { title: podcast.title, description: podcast.description, images: podcast.artwork_url ? [podcast.artwork_url] : [] },
  };
}

export default async function PublicPodcastPage({ params }: { params: { slug: string } }) {
  const [podcast, episodes] = await Promise.all([getPodcast(params.slug), getEpisodes(params.slug)]);

  if (!podcast) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Mic2 className="h-12 w-12 text-ink-700 mx-auto mb-4" />
          <h1 className="font-display text-2xl text-ink-400 mb-2">Podcast not found</h1>
          <p className="text-ink-600 text-sm">This show may not be published yet.</p>
        </div>
      </div>
    );
  }

  const rssUrl = `${API}/feeds/${podcast.slug}`;

  return (
    <div className="min-h-screen">
      {/* Fixed background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-brand-500/6 blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Podcast header */}
        <div className="flex gap-6 mb-10">
          {podcast.artwork_url ? (
            <img src={podcast.artwork_url} alt={podcast.title} className="h-28 w-28 rounded-2xl object-cover shadow-2xl shadow-black/40 shrink-0" />
          ) : (
            <div className="h-28 w-28 rounded-2xl bg-brand-500/15 flex items-center justify-center shadow-2xl shadow-black/40 shrink-0">
              <Mic2 className="h-12 w-12 text-brand-400" />
            </div>
          )}
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-xs text-brand-400 uppercase tracking-wider font-semibold mb-1">{podcast.category}</p>
            <h1 className="font-display text-3xl text-ink-100 mb-1.5 leading-tight">{podcast.title}</h1>
            <p className="text-sm text-ink-500 mb-3">by {podcast.author}</p>
            <div className="flex flex-wrap items-center gap-2">
              <a href={rssUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass glass-hover text-xs font-medium text-ink-300 transition-colors">
                <Rss className="h-3.5 w-3.5 text-brand-400" /> Subscribe via RSS
              </a>
              {podcast.website_url && (
                <a href={podcast.website_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass glass-hover text-xs font-medium text-ink-300 transition-colors">
                  <ExternalLink className="h-3.5 w-3.5" /> Website
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-ink-400 text-sm leading-relaxed mb-10 max-w-2xl">{podcast.description}</p>

        {/* Episodes */}
        <div>
          <h2 className="font-display text-xl text-ink-200 mb-4">Episodes <span className="text-ink-600 font-sans text-base">({episodes.length})</span></h2>

          {episodes.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <p className="text-ink-600 text-sm">No episodes published yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {episodes.map((ep: { id: number; episode_number?: number; season_number?: number; title: string; summary?: string; description: string; audio_url?: string; audio_content_type?: string; audio_file_size?: number; audio_duration_seconds?: number; formatted_duration?: string; published_at?: string }) => (
                <div key={ep.id} className="glass rounded-xl p-4 group">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {ep.episode_number && (
                          <span className="text-[10px] font-mono text-ink-600">
                            {ep.season_number ? `S${ep.season_number}·` : ""}E{ep.episode_number}
                          </span>
                        )}
                        <h3 className="text-sm font-medium text-ink-200">{ep.title}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-ink-600 mt-1">
                        {ep.formatted_duration && (
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ep.formatted_duration}</span>
                        )}
                        {ep.published_at && <span>{new Date(ep.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>}
                      </div>
                    </div>
                  </div>

                  {ep.summary && <p className="text-xs text-ink-500 mb-3 line-clamp-2">{ep.summary}</p>}

                  {ep.audio_url && (
                    <AudioPlayer
                      src={ep.audio_url}
                      type={ep.audio_content_type ?? "audio/mpeg"}
                      durationSecs={ep.audio_duration_seconds}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/6 text-center">
          <p className="text-xs text-ink-700">
            Hosted on <a href="https://freedompodcasting.com" className="text-ink-500 hover:text-brand-400 transition-colors">FreedomPodcasting</a>
          </p>
        </div>
      </div>
    </div>
  );
}
