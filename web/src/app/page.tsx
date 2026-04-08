import Link from "next/link";
import { Zap, Rss, Users, Sparkles, BarChart2, Shield, CheckCircle2, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { PublicNav } from "@/components/marketing/PublicNav";
import { PublicFooter } from "@/components/marketing/PublicFooter";

export const metadata: Metadata = {
  title: "FreedomPodcasting — Podcast Hosting Made Easy",
  description: "The easiest, most reliable podcast hosting platform. Upload audio, get AI-generated show notes, and publish to Spotify, Apple Podcasts, and every major directory automatically.",
};

const FEATURES = [
  {
    icon: Zap,
    title: "Publish in minutes",
    body: "Upload your audio, hit publish. Your episode is live and distributing within seconds. No encoding, no FTP, no settings maze.",
  },
  {
    icon: Rss,
    title: "Bulletproof RSS feeds",
    body: "iTunes-validated, Spotify-compliant feeds generated automatically. Submit once; we keep them in sync with every directory forever.",
  },
  {
    icon: Sparkles,
    title: "AI show notes & descriptions",
    body: "Upload audio and AI generates your episode title, description, and show notes from the transcript. Save 30+ minutes per episode.",
  },
  {
    icon: Users,
    title: "Team collaboration",
    body: "Invite editors, clients, and producers. Role-based permissions mean the right people see the right controls — nothing more.",
  },
  {
    icon: BarChart2,
    title: "Listener analytics",
    body: "See where your listeners are, which episodes they love, and how your show is growing — all in one clean dashboard.",
  },
  {
    icon: Shield,
    title: "99.9% uptime reliability",
    body: "CDN-backed audio delivery on every plan. Your RSS feed never goes down. Directories never drop your show for a bad feed.",
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

const PLANS = [
  {
    key: "free",
    label: "Free",
    price: "$0",
    period: "",
    features: [
      "1 podcast",
      "1 publish/month",
      "1 member",
      "3 GB storage",
      "AI à la carte — $0.50/min",
    ],
    cta: "Get started free",
    href: "/auth/register",
    highlight: false,
  },
  {
    key: "starter",
    label: "Starter",
    price: "$10",
    period: "/mo",
    features: [
      "3 podcasts",
      "Unlimited episodes",
      "3 members",
      "15 GB storage",
      "AI show notes included",
    ],
    cta: "Start Starter",
    href: "/auth/register",
    highlight: false,
  },
  {
    key: "pro",
    label: "Pro",
    price: "$49",
    period: "/mo",
    features: [
      "10 podcasts",
      "Unlimited episodes",
      "10 members",
      "50 GB storage",
      "AI show notes included",
    ],
    cta: "Go Pro",
    href: "/auth/register",
    highlight: true,
  },
  {
    key: "agency",
    label: "Agency",
    price: "$99",
    period: "/mo",
    features: [
      "Unlimited podcasts",
      "Unlimited episodes",
      "Unlimited members",
      "200 GB storage",
      "AI show notes included",
    ],
    cta: "Contact us",
    href: "mailto:ian@freedompodcasting.com",
    highlight: false,
  },
];

export default function HomePage() {
  return (
    <div style={{ background: "var(--bg-canvas)", color: "var(--text-body)", minHeight: "100vh" }}>
      <PublicNav />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <div
          className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-sm mb-6 border"
          style={{ color: "var(--accent)", borderColor: "rgba(204,0,0,0.3)", background: "rgba(204,0,0,0.05)" }}
        >
          Podcast Hosting · Powered by AI
        </div>

        <h1
          className="font-display text-5xl md:text-6xl leading-tight mb-6 max-w-3xl mx-auto"
          style={{ color: "var(--text-primary)" }}
        >
          Your podcast,<br />live in minutes.
        </h1>

        <p className="text-lg mb-10 max-w-xl mx-auto leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Upload your audio. AI writes your description. Publish to Spotify, Apple Podcasts,
          and every major directory — automatically.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            <Zap className="h-4 w-4" /> Start your podcast free
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-sm font-medium transition-colors public-panel public-panel-hover"
            style={{ color: "var(--text-body)" }}
          >
            Sign In
          </Link>
        </div>

        <p className="text-xs mt-4" style={{ color: "var(--text-faint)" }}>
          No credit card required &nbsp;·&nbsp; Free plan, always available &nbsp;·&nbsp; Cancel anytime
        </p>
      </section>

      <hr className="accent-rule max-w-5xl mx-auto" />

      {/* ── Distribution bar ─────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-14 text-center">
        <p className="text-xs font-bold uppercase tracking-widest mb-8" style={{ color: "var(--text-faint)" }}>
          Publish once. Appear everywhere.
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
          Everything you need. Nothing you don&apos;t.
        </h2>
        <p className="text-sm text-center mb-12" style={{ color: "var(--text-muted)" }}>
          Built for creators who want to publish, not configure.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="public-panel rounded-sm p-6">
              <div
                className="h-10 w-10 rounded-sm flex items-center justify-center mb-4"
                style={{ background: "rgba(204,0,0,0.08)" }}
              >
                <f.icon className="h-5 w-5" style={{ color: "var(--accent)" }} />
              </div>
              <h3 className="font-display text-base mb-2" style={{ color: "var(--text-primary)" }}>
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <hr className="accent-rule max-w-5xl mx-auto" />

      {/* ── Switcher section ─────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="font-display text-3xl mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Switching from Buzzsprout, Libsyn, or Anchor?
          </h2>
          <p className="text-sm mb-12" style={{ color: "var(--text-muted)" }}>
            It takes less time than recording your next episode.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {[
            {
              step: "01",
              title: "Paste your RSS feed URL",
              body: "Drop in the URL from your current host when creating your new organization.",
            },
            {
              step: "02",
              title: "We import everything",
              body: "Episodes, artwork, descriptions, and audio files all migrate to our CDN automatically.",
            },
            {
              step: "03",
              title: "Update your feed URL",
              body: "Swap the URL in Apple Podcasts and Spotify. Your listeners follow seamlessly — no downtime.",
            },
          ].map(({ step, title, body }) => (
            <div key={step} className="public-panel rounded-sm p-6">
              <p
                className="font-display text-3xl font-bold mb-3"
                style={{ color: "rgba(204,0,0,0.25)" }}
              >
                {step}
              </p>
              <h3 className="font-display text-base mb-2" style={{ color: "var(--text-primary)" }}>
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {body}
              </p>
            </div>
          ))}
        </div>

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

      {/* ── Pricing ──────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20" id="pricing">
        <h2
          className="font-display text-3xl text-center mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Simple pricing that grows with you
        </h2>
        <p className="text-sm text-center mb-12" style={{ color: "var(--text-muted)" }}>
          Start free. Add features when your show does.
        </p>

        <div className="grid md:grid-cols-4 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.key}
              className="public-panel rounded-sm p-5 flex flex-col"
              style={plan.highlight ? { borderColor: "rgba(204,0,0,0.4)" } : {}}
            >
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display text-sm" style={{ color: "var(--text-body)" }}>
                    {plan.label}
                  </span>
                  {plan.highlight && (
                    <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {plan.price}
                  <span className="text-sm font-normal" style={{ color: "var(--text-faint)" }}>
                    {plan.period}
                  </span>
                </p>
              </div>

              <ul className="space-y-2 text-xs flex-1 mb-5" style={{ color: "var(--text-muted)" }}>
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-1.5">
                    <CheckCircle2
                      className="h-3 w-3 shrink-0"
                      style={{ color: plan.highlight ? "var(--accent)" : "var(--border-muted)" }}
                    />
                    {feat}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className="text-center text-xs font-medium py-2 px-3 rounded-sm transition-colors"
                style={
                  plan.highlight
                    ? { background: "var(--accent)", color: "#ffffff" }
                    : { background: "var(--bg-raised)", color: "var(--text-body)", border: "1px solid var(--border-subtle)" }
                }
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

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
            Ready to start your podcast?
          </h2>
          <p className="text-base mb-8 max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
            Join thousands of creators who chose freedom over lock-in.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-sm font-medium text-white transition-opacity hover:opacity-90 text-base"
            style={{ background: "var(--accent)" }}
          >
            <Zap className="h-5 w-5" /> Start free — no credit card needed
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
