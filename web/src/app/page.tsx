import Link from "next/link";
import { Mic2, Rss, Users, CheckCircle2, Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FreedomPodcasting — Professional Podcast Hosting",
  description: "Host your podcast, grow your audience, and collaborate with your team. Valid RSS feeds for every major directory.",
};

const FEATURES = [
  {
    icon: Mic2,
    title: "Upload & Publish",
    body: "Upload audio, add show notes, and publish to your RSS feed in minutes. No technical knowledge required.",
  },
  {
    icon: Rss,
    title: "Valid RSS Feed",
    body: "iTunes, Spotify, and Google Podcasts–compatible feeds generated automatically. Submit once, publish everywhere.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    body: "Invite editors and clients to your organization. Manage episode reviews and approvals with role-based access.",
  },
];

const PLANS = [
  {
    key: "free",
    label: "Free",
    price: "$0",
    period: "",
    features: ["1 podcast", "1 publish/month", "1 member", "3 GB storage"],
    cta: "Get started free",
    highlight: false,
  },
  {
    key: "starter",
    label: "Starter",
    price: "$10",
    period: "/mo",
    features: ["3 podcasts", "Unlimited episodes", "3 members", "15 GB storage"],
    cta: "Start Starter",
    highlight: false,
  },
  {
    key: "pro",
    label: "Pro",
    price: "$49",
    period: "/mo",
    features: ["10 podcasts", "Unlimited episodes", "10 members", "50 GB storage"],
    cta: "Go Pro",
    highlight: true,
  },
  {
    key: "agency",
    label: "Agency",
    price: "$99",
    period: "/mo",
    features: ["Unlimited podcasts", "Unlimited episodes", "Unlimited members", "200 GB storage"],
    cta: "Contact us",
    highlight: false,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-ink-950 text-ink-100">

      {/* Nav */}
      <nav className="border-b border-ink-800">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-display text-sm tracking-widest text-ink-50">FREEDOM PODCASTING</span>
          <div className="flex items-center gap-3">
            <Link href="/blog" className="text-sm text-ink-400 hover:text-ink-200 transition-colors px-3 py-1.5">
              Blog
            </Link>
            <Link href="/auth/login" className="text-sm text-ink-400 hover:text-ink-200 transition-colors px-3 py-1.5">
              Sign In
            </Link>
            <Link href="/auth/register"
              className="text-sm font-medium px-4 py-1.5 rounded-sm text-ink-950 transition-colors"
              style={{ background: "var(--accent)" }}>
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="inline-block text-xs font-bold uppercase tracking-widest text-accent border border-accent/30 bg-accent/5 px-3 py-1 rounded-sm mb-6">
          Professional Podcast Hosting
        </div>
        <h1 className="font-display text-5xl md:text-6xl text-ink-50 leading-tight mb-6 max-w-3xl mx-auto">
          Your Voice.<br />Your Audience.<br />Your Freedom.
        </h1>
        <p className="text-lg text-ink-400 mb-10 max-w-xl mx-auto leading-relaxed">
          Upload, publish, and grow your podcast with professional tools built for creators and the teams that support them.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/auth/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-sm font-medium text-ink-950 transition-opacity hover:opacity-90"
            style={{ background: "var(--accent)" }}>
            <Zap className="h-4 w-4" /> Start your podcast free
          </Link>
          <Link href="/auth/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-sm font-medium text-ink-300 panel panel-hover transition-colors">
            Sign In
          </Link>
        </div>
        <p className="text-xs text-ink-600 mt-4">No credit card required. Free plan avaliable now.</p>
      </section>

      <hr className="accent-rule max-w-5xl mx-auto" />

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="font-display text-2xl text-ink-50 text-center mb-12">Everything you need to publish</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="panel rounded-sm p-6">
              <div className="h-10 w-10 rounded-sm bg-accent/10 flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-display text-base text-ink-100 mb-2">{f.title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="accent-rule max-w-5xl mx-auto" />

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="font-display text-2xl text-ink-50 text-center mb-3">Simple, transparent pricing</h2>
        <p className="text-sm text-ink-500 text-center mb-12">Start free. Upgrade when you&apos;re ready.</p>
        <div className="grid md:grid-cols-4 gap-4">
          {PLANS.map((plan) => (
            <div key={plan.key} className={`panel rounded-sm p-5 flex flex-col ${plan.highlight ? "border-accent/40" : ""}`}
              style={plan.highlight ? { borderColor: "rgba(204,0,0,0.4)" } : {}}>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display text-sm text-ink-200">{plan.label}</span>
                  {plan.highlight && <span className="text-[9px] font-bold uppercase tracking-widest text-accent">Popular</span>}
                </div>
                <p className="text-2xl font-bold text-ink-50">
                  {plan.price}<span className="text-sm font-normal text-ink-500">{plan.period}</span>
                </p>
              </div>
              <ul className="space-y-2 text-xs text-ink-500 flex-1 mb-5">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-ink-700 shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register"
                className={`text-center text-xs font-medium py-2 px-3 rounded-sm transition-colors ${
                  plan.highlight
                    ? "text-ink-950 hover:opacity-90"
                    : "panel panel-hover text-ink-300"
                }`}
                style={plan.highlight ? { background: "var(--accent)" } : {}}>
                {plan.cta}
              </Link>
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
            <Link href="/auth/login" className="hover:text-ink-500 transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
