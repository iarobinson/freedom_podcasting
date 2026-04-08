import Link from "next/link";
import { ArrowLeft, RefreshCw, ShieldCheck, GitCompare, Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Podcast Production Tools — FreedomPodcasting",
  description:
    "Free tools for podcasters: find the RSS feed behind any Apple Podcasts URL, validate your feed for directory submission, and compare two feeds side-by-side.",
};

const TOOLS = [
  {
    href: "/tools/feed-flipper",
    icon: RefreshCw,
    title: "Feed Flipper",
    description:
      "Paste any Apple Podcasts URL and instantly get the RSS feed URL behind it. Works with any podcast listed in the Apple Podcasts directory.",
  },
  {
    href: "/tools/feed-validator",
    icon: ShieldCheck,
    title: "Feed Validator",
    description:
      "Comprehensive RSS feed validation against Apple Podcasts, Spotify, and other directory requirements. Check all the things that matter.",
  },
  {
    href: "/tools/feed-comparator",
    icon: GitCompare,
    title: "Feed Comparator",
    description:
      "Compare two RSS feeds side-by-side. Verify your podcast migrated correctly with a GitHub-style diff showing every difference between your old and new feed.",
  },
];

export default function ToolsPage() {
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
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-ink-600 hover:text-ink-400 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Home
        </Link>
      </div>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="inline-block text-xs font-bold uppercase tracking-widest text-accent border border-accent/30 bg-accent/5 px-3 py-1 rounded-sm mb-6">
          Free Tools
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-ink-50 leading-tight mb-4">
          Podcast Production Tools
        </h1>
        <p className="text-lg text-ink-400 max-w-xl leading-relaxed">
          Free utilities for podcasters. Find feed URLs, validate your RSS, and make sure your
          show is ready for every major directory.
        </p>
      </section>

      <hr className="accent-rule max-w-5xl mx-auto" />

      {/* Tool cards */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="panel rounded-sm p-6 panel-hover flex flex-col gap-3 group"
              >
                <div
                  className="h-10 w-10 rounded-sm flex items-center justify-center mb-1"
                  style={{ background: "rgba(204,0,0,0.1)" }}
                >
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <h2 className="font-display text-lg text-ink-100 group-hover:text-ink-50 transition-colors leading-snug">
                  {tool.title}
                </h2>
                <p className="text-sm text-ink-500 leading-relaxed flex-1">{tool.description}</p>
                <div className="flex items-center gap-1 text-sm text-accent mt-auto">
                  Use Tool →
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <hr className="accent-rule max-w-5xl mx-auto" />

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h2 className="font-display text-2xl text-ink-50 mb-3">Ready to host your podcast?</h2>
        <p className="text-sm text-ink-500 mb-8 max-w-md mx-auto">
          Import your existing RSS feed or start fresh. Professional podcast hosting with valid
          feeds for every directory.
        </p>
        <Link
          href="/auth/register"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-sm font-medium text-ink-950 transition-opacity hover:opacity-90"
          style={{ background: "var(--accent)" }}
        >
          <Zap className="h-4 w-4" />
          Start your podcast free
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
