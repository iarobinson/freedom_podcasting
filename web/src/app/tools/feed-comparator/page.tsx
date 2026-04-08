import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import FeedComparatorTool from "./FeedComparatorTool";

export const metadata: Metadata = {
  title: "RSS Feed Comparator — Verify Podcast Migration | FreedomPodcasting",
  description:
    "Compare two RSS feeds side-by-side. Verify your podcast migrated correctly with a GitHub-style diff showing every difference between your old and new feed.",
};

export default function FeedComparatorPage() {
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
              className="text-sm font-medium px-4 py-1.5 rounded-sm text-white transition-colors"
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
          Feed Comparator
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-ink-50 leading-tight mb-4">
          Compare Two RSS Feeds
        </h1>
        <p className="text-lg text-ink-400 max-w-2xl leading-relaxed">
          Paste your original feed and your new feed. We&apos;ll check if they&apos;re semantically
          equivalent and show a GitHub-style diff of any differences.
        </p>
      </section>

      <hr className="accent-rule max-w-5xl mx-auto" />

      {/* Tool */}
      <Suspense
        fallback={
          <div className="max-w-5xl mx-auto px-6 py-12 space-y-4">
            <div className="shimmer-bg h-12 rounded w-full" />
            <div className="shimmer-bg h-12 rounded w-full" />
          </div>
        }
      >
        <FeedComparatorTool />
      </Suspense>

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
