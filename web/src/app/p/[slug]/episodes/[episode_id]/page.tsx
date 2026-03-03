import Link from "next/link";
import { ArrowLeft, Clock, Mic2 } from "lucide-react";
import type { Metadata } from "next";
import { AudioPlayer } from "@/components/ui/AudioPlayer";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

async function getPodcast(slug: string) {
  const res = await fetch(`${API}/public/podcasts/${slug}`, { next: { revalidate: 300 } });
  if (!res.ok) return null;
  return res.json().then((d) => d.data);
}

async function getEpisode(podcastSlug: string, episodeId: string) {
  const res = await fetch(`${API}/public/podcasts/${podcastSlug}/episodes/${episodeId}`, { next: { revalidate: 300 } });
  if (!res.ok) return null;
  return res.json().then((d) => d.data);
}

export async function generateMetadata({ params }: { params: { slug: string; episode_id: string } }): Promise<Metadata> {
  const [podcast, episode] = await Promise.all([
    getPodcast(params.slug),
    getEpisode(params.slug, params.episode_id),
  ]);
  if (!podcast || !episode) return { title: "Episode Not Found" };

  const title = `${episode.title} — ${podcast.title}`;
  const description = episode.summary || episode.description?.slice(0, 160) || "";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: podcast.artwork_url ? [podcast.artwork_url] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: podcast.artwork_url ? [podcast.artwork_url] : [],
    },
  };
}

export default async function EpisodePage({ params }: { params: { slug: string; episode_id: string } }) {
  const [podcast, episode] = await Promise.all([
    getPodcast(params.slug),
    getEpisode(params.slug, params.episode_id),
  ]);

  if (!podcast || !episode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Mic2 className="h-12 w-12 text-ink-700 mx-auto mb-4" />
          <h1 className="font-display text-2xl text-ink-400 mb-2">Episode not found</h1>
          <p className="text-ink-600 text-sm">This episode may not be published yet.</p>
          <Link href={`/p/${params.slug}`} className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to podcast
          </Link>
        </div>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    name: episode.title,
    description: episode.summary || episode.description,
    datePublished: episode.published_at,
    duration: episode.audio_duration_seconds ? `PT${Math.floor(episode.audio_duration_seconds / 60)}M${episode.audio_duration_seconds % 60}S` : undefined,
    associatedMedia: episode.audio_url ? { "@type": "MediaObject", contentUrl: episode.audio_url } : undefined,
    partOfSeries: {
      "@type": "PodcastSeries",
      name: podcast.title,
      url: `https://app.freedompodcasting.com/p/${podcast.slug}`,
    },
    image: podcast.artwork_url ?? undefined,
  };

  return (
    <div className="min-h-screen bg-ink-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Back link */}
        <Link href={`/p/${podcast.slug}`} className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-accent transition-colors mb-8">
          <ArrowLeft className="h-3.5 w-3.5" />
          {podcast.title}
        </Link>

        {/* Podcast identity */}
        <div className="flex items-center gap-3 mb-8">
          {podcast.artwork_url ? (
            <img src={podcast.artwork_url} alt={podcast.title} className="h-12 w-12 rounded-sm object-cover shrink-0" />
          ) : (
            <div className="h-12 w-12 rounded-sm bg-accent/10 flex items-center justify-center shrink-0">
              <Mic2 className="h-5 w-5 text-accent" />
            </div>
          )}
          <div>
            <p className="text-xs text-ink-500">{podcast.author}</p>
            <p className="text-sm text-ink-300 font-medium">{podcast.title}</p>
          </div>
        </div>

        {/* Episode number */}
        {(episode.episode_number || episode.season_number) && (
          <p className="text-xs font-mono text-ink-600 mb-2">
            {episode.season_number ? `Season ${episode.season_number} · ` : ""}
            {episode.episode_number ? `Episode ${episode.episode_number}` : ""}
          </p>
        )}

        {/* Title */}
        <h1 className="font-display text-3xl text-ink-50 leading-tight mb-4">{episode.title}</h1>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-xs text-ink-600 mb-6">
          {episode.formatted_duration && (
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{episode.formatted_duration}</span>
          )}
          {episode.published_at && (
            <span>{new Date(episode.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          )}
        </div>

        {/* Player */}
        {episode.audio_url && (
          <div className="panel rounded-sm p-4 mb-8">
            <AudioPlayer
              src={episode.audio_url}
              type={episode.audio_content_type ?? "audio/mpeg"}
              durationSecs={episode.audio_duration_seconds}
            />
          </div>
        )}

        {/* Summary */}
        {episode.summary && (
          <div className="panel rounded-sm p-4 mb-6">
            <p className="text-sm text-ink-300 leading-relaxed">{episode.summary}</p>
          </div>
        )}

        {/* Full description */}
        {episode.description && (
          <div className="text-sm text-ink-400 leading-relaxed whitespace-pre-line">
            {episode.description}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-ink-800 text-center">
          <p className="text-xs text-ink-700">
            Hosted on <a href="https://freedompodcasting.com" className="text-ink-500 hover:text-accent transition-colors">FreedomPodcasting</a>
          </p>
        </div>
      </div>
    </div>
  );
}
