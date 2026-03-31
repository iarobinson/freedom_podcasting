import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import FeedValidatorTool from "./FeedValidatorTool";

export const metadata: Metadata = {
  title: "Podcast Feed Validator — Check RSS for Apple Podcasts & Spotify | FreedomPodcasting",
  description:
    "Validate your podcast RSS feed against Apple Podcasts, Spotify, and other directory requirements. Free comprehensive feed checker.",
};

export default function FeedValidatorPage() {
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
          Feed Validator
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-ink-50 leading-tight mb-4">
          Validate Your Podcast RSS Feed
        </h1>
        <p className="text-lg text-ink-400 max-w-2xl leading-relaxed">
          Check your RSS feed against Apple Podcasts, Spotify, and other directory requirements.
          Catch missing fields, broken audio links, and formatting issues before they cause problems.
        </p>
      </section>

      <hr className="accent-rule max-w-5xl mx-auto" />

      {/* Tool — Suspense required for useSearchParams */}
      <Suspense
        fallback={
          <div className="max-w-5xl mx-auto px-6 py-12">
            <div className="max-w-2xl space-y-3">
              <div className="shimmer-bg h-4 rounded w-1/4" />
              <div className="shimmer-bg h-12 rounded w-full" />
            </div>
          </div>
        }
      >
        <FeedValidatorTool />
      </Suspense>

      {/* FAQ */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <hr className="accent-rule mb-12" />
        <h2 className="font-display text-xl text-ink-50 mb-8">
          What Does the Feed Validator Check?
        </h2>
        <div className="grid md:grid-cols-2 gap-4 max-w-4xl">
          {[
            {
              title: "Feed Accessibility",
              items: ["HTTP status code (must be 200)", "Response time", "Content-Type header", "XML well-formedness"],
            },
            {
              title: "Channel Required Fields",
              items: ["<title>", "<link>", "<description>", "<language> with valid format"],
            },
            {
              title: "iTunes Required Fields",
              items: ["<itunes:image> with href", "<itunes:author>", "<itunes:owner> + email", "<itunes:category>"],
            },
            {
              title: "Episode Validation",
              items: ["Title + enclosure for each episode", "Unique GUIDs", "Valid pubDate format", "Audio file accessibility"],
            },
            {
              title: "Image Validation",
              items: ["Artwork URL accessible", "JPEG or PNG format", "HTTP status check"],
            },
            {
              title: "Technical",
              items: ["HTTPS feed URL", "atom:link rel=self present", "Feed size check"],
            },
          ].map((section) => (
            <div key={section.title} className="panel rounded-sm p-5">
              <h3 className="font-medium text-ink-200 mb-3 text-sm">{section.title}</h3>
              <ul className="space-y-1.5">
                {section.items.map((item) => (
                  <li key={item} className="text-xs text-ink-500 flex items-start gap-2">
                    <span className="text-accent mt-0.5">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
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
