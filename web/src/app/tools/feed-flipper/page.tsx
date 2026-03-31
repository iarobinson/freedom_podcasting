"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Check, Zap } from "lucide-react";
import type { Metadata } from "next";

// Metadata must be in a separate server component when using "use client".
// We export it from a wrapper — but since this IS the page and is a client
// component, we declare the metadata export here (Next.js 14 supports this).

function extractAppleId(url: string): string | null {
  const match = url.match(/\/id(\d+)/);
  return match ? match[1] : null;
}

interface FlipResult {
  feedUrl: string;
  podcastTitle?: string;
}

export default function FeedFlipperPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FlipResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = extractAppleId(url);
    if (!id) {
      setResult(null);
      if (url.trim().length > 10) {
        setError("No Apple Podcast ID found in this URL. Make sure it includes /id followed by numbers.");
      } else {
        setError(null);
      }
      return;
    }

    setError(null);
    const timer = setTimeout(async () => {
      setLoading(true);
      setResult(null);
      try {
        const res = await fetch(
          `https://itunes.apple.com/lookup?id=${id}&entity=podcast`
        );
        const data = await res.json();
        if (data.resultCount > 0 && data.results[0]?.feedUrl) {
          setResult({
            feedUrl: data.results[0].feedUrl,
            podcastTitle: data.results[0].trackName,
          });
        } else {
          setError(
            "No RSS feed URL found for this podcast. It may have been removed from Apple Podcasts or the feed is unlisted."
          );
        }
      } catch {
        setError("Could not reach the iTunes API. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [url]);

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.feedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail — user can manually select the URL
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 text-ink-100">
      {/* Nav */}
      <nav className="border-b border-ink-800">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-display text-sm tracking-widest text-ink-50">
            FREEDOM PODCASTING
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/blog" className="text-sm text-ink-400 hover:text-ink-200 transition-colors px-3 py-1.5">
              Blog
            </Link>
            <Link href="/tools" className="text-sm text-ink-300 hover:text-ink-200 transition-colors px-3 py-1.5">
              Tools
            </Link>
            <Link href="/auth/login" className="text-sm text-ink-400 hover:text-ink-200 transition-colors px-3 py-1.5">
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="text-sm font-medium px-4 py-1.5 rounded-sm text-ink-950 transition-colors"
              style={{ background: "var(--accent)" }}
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-6 pt-6 pb-2">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-xs text-ink-600 hover:text-ink-400 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Tools
        </Link>
      </div>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="inline-block text-xs font-bold uppercase tracking-widest text-accent border border-accent/30 bg-accent/5 px-3 py-1 rounded-sm mb-6">
          Feed Flipper
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-ink-50 leading-tight mb-4">
          Find the RSS Feed Behind Any Apple Podcasts URL
        </h1>
        <p className="text-lg text-ink-400 max-w-2xl leading-relaxed">
          Paste an Apple Podcasts link and instantly get the RSS feed URL powering it. Perfect
          for switching podcast hosts, importing your show, or verifying your feed is live.
        </p>
      </section>

      <hr className="accent-rule max-w-5xl mx-auto" />

      {/* Tool */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="max-w-2xl">
          <label className="block text-sm font-medium text-ink-300 mb-2">
            Apple Podcasts URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://podcasts.apple.com/us/podcast/my-show/id123456789"
            className="w-full panel rounded-sm px-4 py-3 text-sm text-ink-100 placeholder:text-ink-700 focus:outline-none focus:border-accent/50 transition-colors"
            autoFocus
          />
          <p className="text-xs text-ink-600 mt-2">
            The RSS feed URL appears automatically as soon as a valid Apple Podcasts link is detected.
          </p>

          {/* Loading */}
          {loading && (
            <div className="panel rounded-sm p-5 mt-4">
              <div className="shimmer-bg h-3 rounded w-1/3 mb-3" />
              <div className="shimmer-bg h-4 rounded w-full mb-2" />
              <div className="shimmer-bg h-4 rounded w-4/5" />
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div
              className="panel rounded-sm p-5 mt-4"
              style={{ borderColor: "rgba(204,0,0,0.2)" }}
            >
              {result.podcastTitle && (
                <p className="text-xs text-ink-600 mb-2">
                  Podcast:{" "}
                  <span className="text-ink-300 font-medium">{result.podcastTitle}</span>
                </p>
              )}
              <p className="font-mono text-sm text-ink-200 break-all leading-relaxed mb-4">
                {result.feedUrl}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 panel panel-hover rounded-sm text-ink-300 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-accent" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy URL
                    </>
                  )}
                </button>
                <Link
                  href={`/tools/feed-validator?url=${encodeURIComponent(result.feedUrl)}`}
                  className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-light transition-colors"
                >
                  Validate this feed →
                </Link>
              </div>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <p className="text-sm text-accent mt-3">{error}</p>
          )}
        </div>
      </section>

      <hr className="accent-rule max-w-5xl mx-auto" />

      {/* FAQ */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="font-display text-xl text-ink-50 mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4 max-w-2xl">
          {[
            {
              q: "What is a podcast RSS feed?",
              a: "An RSS feed is an XML file that contains all your podcast episodes and metadata. Every podcast directory — Apple Podcasts, Spotify, Google Podcasts — reads your RSS feed to display your show. When you publish a new episode, your RSS feed updates and all directories pick it up automatically.",
            },
            {
              q: "Why would I need my RSS feed URL?",
              a: "You need your RSS feed URL to submit your podcast to directories, switch podcast hosting providers, or import your show into a new platform. The Feed Flipper makes it easy to find the feed URL for any podcast on Apple Podcasts.",
            },
            {
              q: "Does this work for all Apple Podcasts?",
              a: "Yes — this tool uses the official Apple iTunes Search API to look up feed URLs. It works for any podcast that is publicly listed in the Apple Podcasts directory. Podcasts that have been removed or delisted may not return a feed URL.",
            },
            {
              q: "What if no feed URL is found?",
              a: "This can happen if the podcast has been removed from Apple Podcasts, the feed is unlisted, or the podcast was submitted very recently and hasn't fully indexed yet. Try again in a few hours, or check directly with the podcast host.",
            },
          ].map((faq) => (
            <div key={faq.q} className="panel rounded-sm p-5">
              <h3 className="font-medium text-ink-200 mb-2 text-sm">{faq.q}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="accent-rule max-w-5xl mx-auto" />

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h2 className="font-display text-2xl text-ink-50 mb-3">
          Ready to import your podcast?
        </h2>
        <p className="text-sm text-ink-500 mb-8 max-w-md mx-auto">
          Use your RSS feed URL to migrate your entire podcast — episodes, artwork, and metadata —
          to FreedomPodcasting in minutes.
        </p>
        <Link
          href="/auth/register"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-sm font-medium text-ink-950 transition-opacity hover:opacity-90"
          style={{ background: "var(--accent)" }}
        >
          <Zap className="h-4 w-4" />
          Import your podcast free
        </Link>
        <p className="text-xs text-ink-600 mt-4">No credit card required.</p>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-800 mt-8">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-ink-700">
          <span>© {new Date().getFullYear()} FreedomPodcasting. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/blog" className="hover:text-ink-500 transition-colors">Blog</Link>
            <Link href="/tools" className="hover:text-ink-500 transition-colors">Tools</Link>
            <Link href="/auth/login" className="hover:text-ink-500 transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
