import Link from "next/link";
import { Zap, Rss, Users, Sparkles, BarChart2, Shield, ArrowRight, Link2, ListChecks, Send } from "lucide-react";
import type { Metadata } from "next";
import { PublicNav } from "@/components/marketing/PublicNav";
import { PublicFooter } from "@/components/marketing/PublicFooter";
import { PricingSection } from "@/components/marketing/PricingSection";

export const metadata: Metadata = {
  title: "FreedomPodcasting — Professional Podcast Hosting for Creators and Brands",
  description: "Professional podcast hosting for serious creators, brands, and teams. Generate episode titles, descriptions, and show notes with AI, keep control of your feed, and distribute everywhere your audience listens.",
};

const FEATURES = [
  {
    icon: Zap,
    title: "Publish in minutes",
    body: "Upload your audio, review the details, and publish in a few clicks. No confusing setup, no technical maze, no wasted time.",
  },
  {
    icon: Rss,
    title: "Reliable RSS feeds",
    body: "iTunes-validated, Spotify-compliant feeds generated automatically. Submit once, then manage your show from one reliable source.",
  },
  {
    icon: Sparkles,
    title: "AI titles, descriptions, and show notes",
    body: "Generate episode titles, descriptions, and show notes from your transcript in seconds, so every episode is easier to publish and promote.",
    featured: true,
  },
  {
    icon: Users,
    title: "Team collaboration",
    body: "Invite editors, producers, and clients with the right level of access, so your workflow stays organized without giving everyone full control.",
  },
  {
    icon: BarChart2,
    title: "Listener analytics",
    body: "Track how your show is performing from one clean dashboard, with the insights you need to monitor activity and growth.",
  },
  {
    icon: Shield,
    title: "Reliable delivery",
    body: "Your audio is delivered through a reliable CDN-backed system designed to keep episodes available and feeds stable across every major platform.",
  },
];

const MIGRATION_STEPS = [
  {
    icon: Link2,
    title: "Import",
    body: "Paste your current RSS feed or show URL to begin the migration.",
  },
  {
    icon: ListChecks,
    title: "Review",
    body: "We pull in your episodes, artwork, descriptions, and audio so you can confirm everything looks right.",
  },
  {
    icon: Send,
    title: "Publish",
    body: "Point your feed to your new home and keep publishing from one cleaner dashboard.",
  },
];

const PLATFORMS = [
  "Apple Podcasts",
  "Spotify",
  "Amazon Music",
  "Pocket Casts",
  "Overcast",
  "RSS — any app",
];

export default function HomePage() {
  return (
    <div style={{ background: "var(--bg-canvas)", color: "var(--text-body)", minHeight: "100vh" }}>
      <PublicNav />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <p className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: "var(--text-faint)" }}>
          Podcast hosting for serious creators and brands
        </p>

        <h1
          className="font-display text-5xl md:text-6xl leading-tight mb-6 max-w-3xl mx-auto"
          style={{ color: "var(--text-primary)" }}
        >
          Professional podcast hosting, without the platform headache.
        </h1>

        <p className="text-lg mb-5 max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Host, manage, and publish your podcast from one clean dashboard. Generate episode titles,
          descriptions, and show notes with AI, keep control of your feed, and distribute everywhere
          your audience listens.
        </p>

        <p className="text-sm font-medium mb-3" style={{ color: "var(--text-body)" }}>
          Built by Freedom Podcasting, supporting world-class podcasts since 2013.
        </p>

        <p className="text-xs mb-10" style={{ color: "var(--text-faint)" }}>
          No credit card required &nbsp;·&nbsp; Free plan available &nbsp;·&nbsp; Cancel anytime
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            Start free
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-sm font-medium transition-colors public-panel public-panel-hover"
            style={{ color: "var(--text-body)" }}
          >
            Sign In
          </Link>
        </div>
      </section>

      <hr className="accent-rule max-w-5xl mx-auto" />

      {/* ── Distribution bar ─────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-14 text-center">
        <h2 className="font-display text-2xl mb-3" style={{ color: "var(--text-primary)" }}>
          Publish once. Appear everywhere.
        </h2>
        <p className="text-sm mb-8 max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
          Distribute your show across every major podcast platform from one reliable feed,
          without extra tools or messy workarounds.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {PLATFORMS.map((p) => (
            <span
              key={p}
              className="text-xs font-medium px-4 py-2 rounded-sm border"
              style={{ color: "var(--text-muted)", borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}
            >
              {p}
            </span>
          ))}
        </div>
      </section>

      <hr className="accent-rule max-w-5xl mx-auto" />

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20" id="features">
        <h2
          className="font-display text-3xl text-center mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Everything serious podcasters need. Nothing that gets in the way.
        </h2>
        <p className="text-sm text-center mb-12 max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
          Built for creators, brands, and teams who want a clean publishing workflow, reliable
          hosting, and smarter tools behind the scenes.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="public-panel rounded-sm p-6"
              style={f.featured ? { borderColor: "rgba(204,0,0,0.4)", background: "linear-gradient(180deg, rgba(204,0,0,0.06), transparent 60%), var(--bg-surface)" } : {}}
            >
              <div
                className="h-10 w-10 rounded-sm flex items-center justify-center mb-4"
                style={{ background: "rgba(204,0,0,0.08)" }}
              >
                <f.icon className="h-5 w-5" style={{ color: "var(--accent)" }} />
              </div>
              <h3 className="font-display text-base mb-2" style={{ color: "var(--text-primary)" }}>
                {f.title}
              </h3>
              {f.featured && (
                <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>
                  Included on paid plans
                </p>
              )}
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <hr className="accent-rule max-w-5xl mx-auto" />

      {/* ── Migration section ────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="font-display text-3xl mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Move your show in minutes.
          </h2>
          <p className="text-sm mb-12" style={{ color: "var(--text-muted)" }}>
            Already hosted somewhere else? Bring your podcast over without rebuilding everything from scratch.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {MIGRATION_STEPS.map(({ icon: Icon, title, body }, i) => (
            <div key={title} className="public-panel rounded-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="h-10 w-10 rounded-sm flex items-center justify-center"
                  style={{ background: "rgba(204,0,0,0.08)" }}
                >
                  <Icon className="h-5 w-5" style={{ color: "var(--accent)" }} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>
                  Step {i + 1}
                </span>
              </div>
              <h3 className="font-display text-base mb-2" style={{ color: "var(--text-primary)" }}>
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {body}
              </p>
            </div>
          ))}
        </div>

        <p className="text-xs text-center mb-8" style={{ color: "var(--text-faint)" }}>
          No need to recreate your show manually.
        </p>

        <div className="text-center">
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 text-sm font-bold transition-colors"
            style={{ color: "var(--accent)" }}
          >
            Import your podcast free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <hr className="accent-rule max-w-5xl mx-auto" />

      <PricingSection />

      <hr className="accent-rule max-w-5xl mx-auto" />

      {/* ── Final CTA banner ─────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div
          className="engraving-bg public-panel rounded-sm px-8 py-16 text-center"
        >
          <h2
            className="font-display text-4xl mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Ready to host your podcast with more control and less friction?
          </h2>
          <p className="text-base mb-8 max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
            Start free, move an existing show, or choose a plan that fits the way you publish.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-sm font-medium text-white transition-opacity hover:opacity-90 text-base"
            style={{ background: "var(--accent)" }}
          >
            Start free — no credit card needed
          </Link>
          <p className="text-xs mt-4" style={{ color: "var(--text-faint)" }}>
            Free plan includes 1 podcast, 3 GB storage, and unlimited listening.
          </p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
