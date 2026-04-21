"use client";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Zap } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "When we started The Productivity Show, we wanted to focus on what we do best — creating content — and we knew we'd want experts like Freedom Podcasting to focus on what they do best. When we upload the file, everything will be taken care of quickly and reliably.",
    name: "Thanh Pham",
    show: "The Productivity Show",
    photo: "https://i0.wp.com/freedompodcasting.com/wp-content/uploads/Thanh-Pham.jpg?fit=300%2C240&ssl=1",
  },
  {
    quote:
      "We began our partnership with Freedom Podcasting five years ago. Thanks to FP's expertise, guidance and professionalism, we can focus solely on content, and we continue to improve as our audience grows. We also produce an award-winning podcast consistently featured in iTunes.",
    name: "Ken White, Ph.D",
    show: "Leadership & Business",
    photo: "https://i0.wp.com/freedompodcasting.com/wp-content/uploads/Ken-White.jpg?fit=200%2C300&ssl=1",
  },
  {
    quote:
      "Freedom Podcasting is fiercely committed to excellence. They are thoughtful, elegantly skilled in their work, crazy-efficient and incredibly supportive. These folks are the gold standard of what a production company should be, and I recommend them unreservedly.",
    name: "Ken Page, LCSW",
    show: "The Deeper Dating Podcast",
    photo: "https://i0.wp.com/freedompodcasting.com/wp-content/uploads/ken-page.png?fit=300%2C300&ssl=1",
  },
  {
    quote:
      "Freedom Podcasting has an undeniable formula that makes the creation and delivery of your show an amazing experience. My podcast quickly became top-rated in the iTunes store, and continues to be featured four years later.",
    name: "Lori Crete",
    show: "The Beauty Biz Show",
    photo: "https://i0.wp.com/freedompodcasting.com/wp-content/uploads/Lori-Crete-1.jpg?fit=284%2C300&ssl=1",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Sign up free",
    body: "Create your account. No credit card required. Takes 60 seconds.",
  },
  {
    step: "02",
    title: "Paste your RSS feed URL",
    body: "Drop in the feed URL from Buzzsprout, Libsyn, Anchor, or any host. We import your episodes, artwork, and descriptions automatically.",
  },
  {
    step: "03",
    title: "Update one URL",
    body: "Swap the feed URL in Apple Podcasts and Spotify. Your subscribers follow automatically — zero downtime, zero lost listeners.",
  },
];

const COMPARE = [
  { feature: "Unlimited episode storage",  fp: true,  others: "Extra fees" },
  { feature: "AI show notes per episode",  fp: true,  others: "Not included" },
  { feature: "RSS import from any host",   fp: true,  others: "Manual only" },
  { feature: "Free plan available",        fp: true,  others: "Trial only" },
  { feature: "No egress / bandwidth fees", fp: true,  others: "Common" },
  { feature: "Team collaboration",         fp: true,  others: "Paid add-on" },
];

function SwitchPageContent() {
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const registerUrl = `/auth/register${qs ? `?${qs}` : ""}`;

  return (
    <div style={{ background: "var(--bg-canvas)", color: "var(--text-body)", minHeight: "100vh" }}>

      {/* ── Minimal nav ── */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{
          background: "color-mix(in srgb, var(--bg-canvas) 85%, transparent)",
          borderColor: "var(--border-subtle)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="shrink-0">
            <picture>
              <source srcSet="/Freedom-Podcasting-Company-Logo.png" media="(prefers-color-scheme: light)" />
              <img
                src="/Freedom-Podcasting-Company-Logo-white-red.png"
                alt="Freedom Podcasting"
                width={180}
                height={60}
                style={{ height: "32px", width: "auto" }}
              />
            </picture>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="text-sm px-3 py-1.5 rounded-sm transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              Sign In
            </Link>
            <Link
              href={registerUrl}
              className="text-sm font-medium px-4 py-1.5 rounded-sm text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--accent)" }}
            >
              Switch Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div
          className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-sm mb-6 border"
          style={{ color: "var(--accent)", borderColor: "rgba(204,0,0,0.3)", background: "rgba(204,0,0,0.05)" }}
        >
          Switching from Buzzsprout · Libsyn · Anchor · Any Host
        </div>

        <h1
          className="font-display text-5xl md:text-6xl leading-tight mb-5 max-w-3xl mx-auto"
          style={{ color: "var(--text-primary)" }}
        >
          Move your podcast.<br />Keep every listener.
        </h1>

        <p className="text-xl mb-3 max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Paste your RSS feed. We import your entire catalog — episodes, artwork,
          descriptions — automatically. Subscribers follow with zero downtime.
        </p>
        <p className="text-base mb-10 max-w-xl mx-auto" style={{ color: "var(--text-faint)" }}>
          Most shows are fully switched in under 10 minutes.
        </p>

        <Link
          href={registerUrl}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-sm font-medium text-white text-lg transition-opacity hover:opacity-90"
          style={{ background: "var(--accent)" }}
        >
          <Zap className="h-5 w-5" /> Switch for free
        </Link>
        <p className="text-xs mt-3" style={{ color: "var(--text-faint)" }}>
          No credit card required &nbsp;·&nbsp; Your original feed stays untouched during migration
        </p>
      </section>

      {/* ── How it works ── */}
      <section
        className="border-y py-16"
        style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}
      >
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-display text-3xl text-center mb-3" style={{ color: "var(--text-primary)" }}>
            Three steps. Under 10 minutes.
          </h2>
          <p className="text-sm text-center mb-12" style={{ color: "var(--text-muted)" }}>
            No manual re-uploading. No lost episodes. No downtime.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map(({ step, title, body }) => (
              <div key={step} className="public-panel rounded-sm p-6">
                <p
                  className="font-display text-4xl font-bold mb-4 leading-none"
                  style={{ color: "rgba(204,0,0,0.18)" }}
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
        </div>
      </section>

      {/* ── Comparison table ── */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="font-display text-3xl text-center mb-3" style={{ color: "var(--text-primary)" }}>
          Why podcasters switch to us
        </h2>
        <p className="text-sm text-center mb-12" style={{ color: "var(--text-muted)" }}>
          Everything your old host charged extra for — included.
        </p>

        <div
          className="public-panel rounded-sm overflow-hidden"
        >
          {/* Header */}
          <div
            className="grid grid-cols-3 text-xs font-bold uppercase tracking-widest py-3 px-6 border-b"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-faint)" }}
          >
            <span className="col-span-1">Feature</span>
            <span className="text-center" style={{ color: "var(--accent)" }}>Freedom Podcasting</span>
            <span className="text-center">Other hosts</span>
          </div>

          {COMPARE.map(({ feature, fp, others }, i) => (
            <div
              key={feature}
              className="grid grid-cols-3 items-center py-3.5 px-6 text-sm border-b last:border-0"
              style={{
                borderColor: "var(--border-subtle)",
                background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
              }}
            >
              <span style={{ color: "var(--text-body)" }}>{feature}</span>
              <span className="text-center">
                {fp && <CheckCircle2 className="h-4 w-4 mx-auto" style={{ color: "var(--accent)" }} />}
              </span>
              <span className="text-center text-xs" style={{ color: "var(--text-faint)" }}>
                {others}
              </span>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href={registerUrl}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            Switch for free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section
        className="border-t py-20"
        style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}
      >
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-display text-3xl text-center mb-3" style={{ color: "var(--text-primary)" }}>
            Shows that made the switch
          </h2>
          <p className="text-sm text-center mb-12" style={{ color: "var(--text-muted)" }}>
            Award-winning podcasts. Loyal audiences. Zero migration headaches.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {TESTIMONIALS.map(({ quote, name, show, photo }) => (
              <div key={name} className="public-panel rounded-sm p-6 flex flex-col gap-4">
                <p className="text-sm leading-relaxed flex-1" style={{ color: "var(--text-muted)" }}>
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo}
                    alt={name}
                    className="rounded-full object-cover shrink-0"
                    style={{ width: 40, height: 40 }}
                  />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{name}</p>
                    <p className="text-xs" style={{ color: "var(--text-faint)" }}>{show}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="engraving-bg public-panel rounded-sm px-8 py-16 text-center">
          <h2 className="font-display text-4xl mb-4" style={{ color: "var(--text-primary)" }}>
            Ready to make the switch?
          </h2>
          <p className="text-base mb-2 max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
            Sign up free, paste your RSS feed, and your entire catalog migrates automatically.
            Your original host keeps running — no risk, no rush.
          </p>
          <p className="text-sm mb-8 max-w-sm mx-auto" style={{ color: "var(--text-faint)" }}>
            Cancel your old host once you&apos;ve confirmed everything looks perfect.
          </p>
          <Link
            href={registerUrl}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-sm font-medium text-white transition-opacity hover:opacity-90 text-base"
            style={{ background: "var(--accent)" }}
          >
            <Zap className="h-5 w-5" /> Switch for free <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-xs mt-4" style={{ color: "var(--text-faint)" }}>
            No credit card &nbsp;·&nbsp; Free plan always available &nbsp;·&nbsp; Cancel anytime
          </p>
        </div>
      </section>

      {/* ── Minimal footer ── */}
      <footer className="border-t py-8" style={{ borderColor: "var(--border-subtle)" }}>
        <div
          className="max-w-5xl mx-auto px-6 flex items-center justify-between text-xs"
          style={{ color: "var(--text-faint)" }}
        >
          <span>© {new Date().getFullYear()} Freedom Podcasting</span>
          <div className="flex items-center gap-4">
            <Link href="/" style={{ color: "var(--text-faint)" }} className="hover:underline">Home</Link>
            <Link href="/auth/login" style={{ color: "var(--text-faint)" }} className="hover:underline">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function SwitchPage() {
  return (
    <Suspense fallback={null}>
      <SwitchPageContent />
    </Suspense>
  );
}
