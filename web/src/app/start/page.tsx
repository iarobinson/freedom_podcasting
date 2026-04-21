"use client";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Zap, CheckCircle2, ArrowRight, Mic, Sparkles, Rss } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "Podcasting is blowing up and if you want to have a great show then you must have a seasoned pro editing and producing it. That is where I use Ian and his team to make it work for me, and recommend him to everyone I know.",
    name: "Lewis Howes",
    show: "The School of Greatness",
    photo: "https://i0.wp.com/freedompodcasting.com/wp-content/uploads/Lewis-Howes.jpg?fit=300%2C300&ssl=1",
  },
  {
    quote:
      "We debuted at #2 in the Business Category of iTunes and in the Top 30 of ALL podcasts in iTunes, and it was no accident thanks to his advice. My team and I were blown away by his dedication and knowledge regarding podcasts.",
    name: "Ali Brown",
    show: "Glambition™ Radio",
    photo: "https://i0.wp.com/freedompodcasting.com/wp-content/uploads/ali.jpg?fit=300%2C300&ssl=1",
  },
  {
    quote:
      "Working with Ian and the Freedom Podcasting team is one of the best business decisions I've made. His launch strategy helped my podcast premier at #1 on iTunes in its first two weeks. Six months later, I have paid sponsors and incredible access to experts.",
    name: "Alexandra Jamieson",
    show: "Her Rules Radio",
    photo: "https://i0.wp.com/freedompodcasting.com/wp-content/uploads/alex-jamieson.jpg?fit=300%2C300&ssl=1",
  },
  {
    quote:
      "My show was featured in iTunes New and Noteworthy for the first 8 weeks of its release, thanks to their strategic planning. Four years later the show continues to be featured as a Top Show in the iTunes store.",
    name: "Terri Cole",
    show: "The Terri Cole Show",
    photo: "https://i0.wp.com/freedompodcasting.com/wp-content/uploads/The-Terri-Cole-Show.jpg?fit=300%2C300&ssl=1",
  },
];

const STEPS = [
  {
    icon: Mic,
    step: "01",
    title: "Upload your audio",
    body: "Drag and drop your MP3. No encoding software, no FTP, no settings maze. Your file uploads directly to our CDN.",
  },
  {
    icon: Sparkles,
    step: "02",
    title: "AI writes your show notes",
    body: "Our AI transcribes your episode and generates a title, description, and chapter markers — automatically. Save 30+ minutes per episode.",
  },
  {
    icon: Rss,
    step: "03",
    title: "Publish everywhere",
    body: "Hit publish. Your episode distributes to Spotify, Apple Podcasts, Amazon Music, and every major directory within seconds.",
  },
];

const PLANS = [
  {
    key: "free",
    label: "Free",
    price: "$0",
    badge: "Start here",
    badgeAccent: false,
    features: ["1 podcast", "1 episode/month", "3 GB storage", "AI à la carte — $0.50/min"],
    highlight: false,
    primaryCta: true,
  },
  {
    key: "starter",
    label: "Starter",
    price: "$10",
    period: "/mo",
    badge: null,
    badgeAccent: false,
    features: ["3 podcasts", "Unlimited episodes", "3 members", "15 GB storage", "AI show notes included"],
    highlight: false,
    primaryCta: false,
  },
  {
    key: "pro",
    label: "Pro",
    price: "$49",
    period: "/mo",
    badge: "Most popular",
    badgeAccent: true,
    features: ["10 podcasts", "Unlimited episodes", "10 members", "50 GB storage", "AI show notes included"],
    highlight: true,
    primaryCta: false,
  },
  {
    key: "agency",
    label: "Agency",
    price: "$99",
    period: "/mo",
    badge: null,
    badgeAccent: false,
    features: ["Unlimited podcasts", "Unlimited episodes", "Unlimited members", "200 GB storage", "AI show notes included"],
    highlight: false,
    primaryCta: false,
  },
];

const SHOW_NAMES = [
  "The School of Greatness",
  "Glambition™ Radio",
  "The Productivity Show",
  "The Terri Cole Show",
  "She's Got Moxie",
  "Leadership & Business",
  "Her Rules Radio",
];

function StartPageContent() {
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const registerUrl = `/auth/register${qs ? `?${qs}` : ""}`;

  return (
    <div style={{ background: "var(--bg-canvas)", color: "var(--text-body)", minHeight: "100vh" }}>

      {/* ── Minimal nav — keep visitor focused on the CTA ── */}
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
              Start Free
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
          Podcast Hosting · Powered by AI
        </div>

        <h1
          className="font-display text-5xl md:text-6xl leading-tight mb-5 max-w-3xl mx-auto"
          style={{ color: "var(--text-primary)" }}
        >
          Start your podcast today.
        </h1>

        <p className="text-xl mb-3 max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Upload your audio. AI writes your show notes. Publish to Spotify, Apple Podcasts,
          and every major directory — automatically.
        </p>
        <p className="text-base mb-10 max-w-xl mx-auto" style={{ color: "var(--text-faint)" }}>
          No tech headaches. No editing software. Just record and publish.
        </p>

        <Link
          href={registerUrl}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-sm font-medium text-white text-lg transition-opacity hover:opacity-90"
          style={{ background: "var(--accent)" }}
        >
          <Zap className="h-5 w-5" /> Start for free
        </Link>
        <p className="text-xs mt-3" style={{ color: "var(--text-faint)" }}>
          No credit card required &nbsp;·&nbsp; Free plan, always available
        </p>
      </section>

      {/* ── Trust bar ── */}
      <section
        className="border-y py-8"
        style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}
      >
        <div className="max-w-5xl mx-auto px-6">
          <p
            className="text-xs font-bold uppercase tracking-widest text-center mb-5"
            style={{ color: "var(--text-faint)" }}
          >
            Trusted by hosts on these shows
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {SHOW_NAMES.map((name) => (
              <span key={name} className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="font-display text-3xl text-center mb-3" style={{ color: "var(--text-primary)" }}>
          Live in three steps
        </h2>
        <p className="text-sm text-center mb-12" style={{ color: "var(--text-muted)" }}>
          From first recording to every podcast directory, in minutes.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map(({ icon: Icon, step, title, body }) => (
            <div key={step} className="public-panel rounded-sm p-6">
              <p
                className="font-display text-4xl font-bold mb-4 leading-none"
                style={{ color: "rgba(204,0,0,0.18)" }}
              >
                {step}
              </p>
              <div
                className="h-8 w-8 rounded-sm flex items-center justify-center mb-3"
                style={{ background: "rgba(204,0,0,0.08)" }}
              >
                <Icon className="h-4 w-4" style={{ color: "var(--accent)" }} />
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
      </section>

      <hr className="accent-rule max-w-5xl mx-auto" />

      {/* ── Testimonials ── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="font-display text-3xl text-center mb-3" style={{ color: "var(--text-primary)" }}>
          Hosts who launched with us
        </h2>
        <p className="text-sm text-center mb-12" style={{ color: "var(--text-muted)" }}>
          From brand-new shows to the top of iTunes charts.
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
      </section>

      <hr className="accent-rule max-w-5xl mx-auto" />

      {/* ── Pricing ── */}
      <section className="max-w-5xl mx-auto px-6 py-20" id="pricing">
        <h2 className="font-display text-3xl text-center mb-3" style={{ color: "var(--text-primary)" }}>
          Start free. Grow when you&apos;re ready.
        </h2>
        <p className="text-sm text-center mb-12" style={{ color: "var(--text-muted)" }}>
          No contracts. No credit card to start. Cancel anytime.
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
                  {plan.badge && (
                    <span
                      className="text-[9px] font-bold uppercase tracking-widest"
                      style={{ color: plan.badgeAccent ? "var(--accent)" : "var(--text-faint)" }}
                    >
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {plan.price}
                  {"period" in plan && (
                    <span className="text-sm font-normal" style={{ color: "var(--text-faint)" }}>
                      {plan.period}
                    </span>
                  )}
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
                href={registerUrl}
                className="text-center text-xs font-medium py-2 px-3 rounded-sm transition-colors"
                style={
                  plan.primaryCta || plan.highlight
                    ? { background: "var(--accent)", color: "#ffffff" }
                    : { background: "var(--bg-raised)", color: "var(--text-body)", border: "1px solid var(--border-subtle)" }
                }
              >
                {plan.primaryCta ? "Get started free" : `Choose ${plan.label}`}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="engraving-bg public-panel rounded-sm px-8 py-16 text-center">
          <h2 className="font-display text-4xl mb-4" style={{ color: "var(--text-primary)" }}>
            Your podcast could be live today.
          </h2>
          <p className="text-base mb-8 max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
            Sign up free. No credit card required. Your first episode could be on Spotify
            and Apple Podcasts within the hour.
          </p>
          <Link
            href={registerUrl}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-sm font-medium text-white transition-opacity hover:opacity-90 text-base"
            style={{ background: "var(--accent)" }}
          >
            <Zap className="h-5 w-5" /> Start for free <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-xs mt-4" style={{ color: "var(--text-faint)" }}>
            Free plan includes 1 podcast · 3 GB storage · AI show notes à la carte
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
            <Link href="/" style={{ color: "var(--text-faint)" }} className="hover:underline">
              Home
            </Link>
            <Link href="/auth/login" style={{ color: "var(--text-faint)" }} className="hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function StartPage() {
  return (
    <Suspense fallback={null}>
      <StartPageContent />
    </Suspense>
  );
}
