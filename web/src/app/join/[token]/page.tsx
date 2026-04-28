"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, XCircle, Zap } from "lucide-react";
import { publicCheckoutApi } from "@/lib/api";

interface CheckoutInfo {
  org_name:           string;
  price_cents:        number;
  podcast_title:      string | null;
  podcast_artwork:    string | null;
  already_subscribed: boolean;
}

const BENEFITS = [
  "Unlimited episode publishing — no monthly caps",
  "AI-generated show notes from your audio",
  "Bulletproof RSS feed — Spotify & Apple Podcasts compliant",
  "CDN-backed audio delivery — fast everywhere",
  "Full production team access to your show",
];

export default function JoinPage() {
  const { token } = useParams<{ token: string }>();
  const [info, setInfo]         = useState<CheckoutInfo | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    publicCheckoutApi.getInfo(token)
      .then((res) => setInfo(res.data.data))
      .catch((err) => {
        const msg = err?.response?.data?.error ?? "This link is invalid or has expired.";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleCheckout = async () => {
    setChecking(true);
    try {
      const res = await publicCheckoutApi.createSession(token);
      window.location.href = res.data.url;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? "Could not start checkout. Please try again.";
      setError(msg);
      setChecking(false);
    }
  };

  const price = info ? `$${(info.price_cents / 100).toFixed(0)}` : "";

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-canvas)" }}>
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--text-faint)" }} />
      </div>
    );
  }

  // Error state
  if (error || !info) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg-canvas)" }}>
        <div className="max-w-sm w-full text-center space-y-4">
          <XCircle className="h-10 w-10 mx-auto text-red-400" />
          <p className="font-display text-lg" style={{ color: "var(--text-primary)" }}>Link expired or invalid</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {error ?? "This checkout link is no longer valid."} Please contact us for a new one.
          </p>
          <a
            href="mailto:ian@freedompodcasting.com"
            className="inline-block text-sm font-medium underline"
            style={{ color: "var(--accent)" }}
          >
            ian@freedompodcasting.com
          </a>
        </div>
      </div>
    );
  }

  // Already subscribed
  if (info.already_subscribed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg-canvas)" }}>
        <div className="max-w-sm w-full text-center space-y-4">
          <CheckCircle2 className="h-10 w-10 mx-auto text-green-400" />
          <p className="font-display text-lg" style={{ color: "var(--text-primary)" }}>You&apos;re already set up!</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {info.org_name} already has an active subscription. Sign in to access your dashboard.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-sm font-medium text-white text-sm"
            style={{ background: "var(--accent)" }}
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4" style={{ background: "var(--bg-canvas)" }}>
      <div className="max-w-lg mx-auto space-y-8">

        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block mb-8">
            <picture>
              <source srcSet="/Freedom-Podcasting-Company-Logo.png" media="(prefers-color-scheme: light)" />
              <img
                src="/Freedom-Podcasting-Company-Logo-white-red.png"
                alt="Freedom Podcasting"
                style={{ height: "32px", width: "auto" }}
              />
            </picture>
          </Link>
          <p
            className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: "var(--accent)" }}
          >
            Podcast Hosting
          </p>
          <h1 className="font-display text-3xl md:text-4xl mb-2" style={{ color: "var(--text-primary)" }}>
            Welcome, {info.org_name.replace(/'s Podcasts$/, "")}
          </h1>
          <p className="text-base" style={{ color: "var(--text-muted)" }}>
            Your show is already imported and ready to go.
          </p>
        </div>

        {/* Show card */}
        <div
          className="public-panel rounded-sm p-5 flex items-center gap-4"
        >
          {info.podcast_artwork ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={info.podcast_artwork}
              alt={info.podcast_title ?? ""}
              className="rounded-sm object-cover shrink-0"
              style={{ width: 72, height: 72 }}
            />
          ) : (
            <div
              className="rounded-sm shrink-0 flex items-center justify-center"
              style={{ width: 72, height: 72, background: "rgba(204,0,0,0.08)" }}
            >
              <Zap className="h-6 w-6" style={{ color: "var(--accent)" }} />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--text-faint)" }}>
              Your Show
            </p>
            <p className="font-display text-base truncate" style={{ color: "var(--text-primary)" }}>
              {info.podcast_title ?? info.org_name}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Hosted on Freedom Podcasting
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="public-panel rounded-sm p-6 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--text-faint)" }}>
            What&apos;s included
          </p>
          {BENEFITS.map((b) => (
            <div key={b} className="flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{b}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="public-panel rounded-sm p-6 text-center space-y-4">
          <div>
            <p className="font-display text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
              {price}<span className="text-lg font-normal" style={{ color: "var(--text-faint)" }}>/month</span>
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>
              Recurring monthly billing · Cancel anytime
            </p>
          </div>

          <button
            onClick={handleCheckout}
            disabled={checking}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-sm font-medium text-white text-base transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: "var(--accent)" }}
          >
            {checking ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting…</>
            ) : (
              <><Zap className="h-4 w-4" /> Start hosting — {price}/month</>
            )}
          </button>

          <p className="text-xs" style={{ color: "var(--text-faint)" }}>
            Secure checkout via Stripe. You can cancel at any time.
            After subscribing, you can cancel your existing podcast host.
          </p>
        </div>

        {/* Sign in link */}
        <p className="text-center text-xs" style={{ color: "var(--text-faint)" }}>
          Already have a Freedom Podcasting account?{" "}
          <Link href="/auth/login" className="underline" style={{ color: "var(--text-muted)" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
