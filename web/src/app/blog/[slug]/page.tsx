import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import { getAllPosts, getPost } from "@/lib/blog";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      url: `https://app.freedompodcasting.com/blog/${post.slug}`,
    },
  };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const { content } = await compileMDX({ source: post.content });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: "FreedomPodcasting",
      url: "https://app.freedompodcasting.com",
    },
    publisher: {
      "@type": "Organization",
      name: "FreedomPodcasting",
      url: "https://app.freedompodcasting.com",
    },
    url: `https://app.freedompodcasting.com/blog/${post.slug}`,
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
              className="text-sm text-ink-400 hover:text-ink-200 transition-colors px-3 py-1.5"
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

      {/* Article */}
      <article className="max-w-2xl mx-auto px-6 py-16">
        {/* Back */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs text-ink-600 hover:text-ink-400 transition-colors mb-10"
        >
          <ArrowLeft className="h-3 w-3" />
          All posts
        </Link>

        {/* Header */}
        <header className="mb-10">
          <h1 className="font-display text-3xl md:text-4xl text-ink-50 leading-tight mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 text-xs text-ink-600">
            <span>{formatDate(post.date)}</span>
            <span>·</span>
            <span>{post.readingTime}</span>
          </div>
        </header>

        <hr className="accent-rule mb-10" />

        {/* Body */}
        <div className="blog-prose">{content}</div>

        <hr className="accent-rule mt-12 mb-10" />

        {/* CTA */}
        <div className="panel rounded-sm p-6 text-center">
          <p className="text-sm font-semibold text-ink-200 mb-1">
            Ready to start your podcast?
          </p>
          <p className="text-xs text-ink-500 mb-4">
            FreedomPodcasting handles hosting, RSS feeds, transcription, and
            AI-generated show notes — all in one place.
          </p>
          <Link
            href="/auth/register"
            className="inline-block text-sm font-medium px-5 py-2 rounded-sm text-ink-950 hover:opacity-90 transition-opacity"
            style={{ background: "var(--accent)" }}
          >
            Start free
          </Link>
        </div>
      </article>

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
