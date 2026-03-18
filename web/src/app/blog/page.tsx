import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Podcast Production Blog — FreedomPodcasting",
  description:
    "Guides, tips, and tools for podcasters. Learn how to start, produce, and grow your podcast.",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPage() {
  const posts = await getAllPosts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Podcast Production Blog",
    url: "https://app.freedompodcasting.com/blog",
    itemListElement: posts.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://app.freedompodcasting.com/blog/${p.slug}`,
      name: p.title,
    })),
  };

  return (
    <div className="min-h-screen bg-ink-950 text-ink-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Nav */}
      <nav className="border-b border-ink-800">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-sm tracking-widest text-ink-50 hover:text-ink-300 transition-colors"
          >
            FREEDOM PODCASTING
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              className="text-sm text-ink-300 hover:text-ink-100 transition-colors px-3 py-1.5"
            >
              Blog
            </Link>
            <Link
              href="/auth/login"
              className="text-sm text-ink-400 hover:text-ink-200 transition-colors px-3 py-1.5"
            >
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

      {/* Header */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent border border-accent/30 bg-accent/5 px-3 py-1 rounded-sm mb-6">
          <BookOpen className="h-3 w-3" />
          Podcast Production Blog
        </div>
        <h1 className="font-display text-4xl text-ink-50 mb-4">
          Guides for Podcasters
        </h1>
        <p className="text-ink-400 max-w-xl mx-auto leading-relaxed">
          Everything you need to start, produce, and grow your podcast — from
          first episode to full production workflow.
        </p>
      </section>

      <hr className="accent-rule max-w-5xl mx-auto" />

      {/* Posts */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="panel rounded-sm p-6 panel-hover flex flex-col gap-3 group"
            >
              <div>
                <h2 className="font-display text-lg text-ink-100 group-hover:text-ink-50 transition-colors leading-snug mb-2">
                  {post.title}
                </h2>
                <p className="text-sm text-ink-500 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-ink-700 mt-auto pt-3 border-t border-ink-800">
                <span>{formatDate(post.date)}</span>
                <span>·</span>
                <span>{post.readingTime}</span>
                <span className="ml-auto text-accent group-hover:translate-x-0.5 transition-transform">
                  Read →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-800 mt-8">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-ink-700">
          <span>
            © {new Date().getFullYear()} FreedomPodcasting. All rights
            reserved.
          </span>
          <div className="flex items-center gap-4">
            <Link href="/blog" className="hover:text-ink-500 transition-colors">
              Blog
            </Link>
            <Link
              href="/auth/login"
              className="hover:text-ink-500 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
