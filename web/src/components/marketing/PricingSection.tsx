"use client";
import { useState } from "react";
import Link from "next/link";
import { Archive, CheckCircle2 } from "lucide-react";
import { ACTIVE_PLANS, PLAN_CATALOGUE, formatPrice, type BillingInterval } from "@/lib/plans";

const CTA: Record<string, { label: string; href: string }> = {
  free:    { label: "Get started free", href: "/auth/register" },
  starter: { label: "Start Starter",    href: "/auth/register" },
  pro:     { label: "Go Pro",           href: "/auth/register" },
  agency:  { label: "Contact us",       href: "mailto:ian@freedompodcasting.com" },
};

export function BillingToggle({ interval, onChange }: { interval: BillingInterval; onChange: (i: BillingInterval) => void }) {
  return (
    <div
      role="radiogroup"
      aria-label="Billing interval"
      className="inline-flex rounded-sm border p-0.5 text-xs font-bold uppercase tracking-widest"
      style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}
    >
      {(["month", "year"] as const).map((i) => (
        <button
          key={i}
          role="radio"
          aria-checked={interval === i}
          onClick={() => onChange(i)}
          className="px-4 py-1.5 rounded-sm transition-colors"
          style={interval === i ? { background: "var(--accent)", color: "#ffffff" } : { color: "var(--text-muted)" }}
        >
          {i === "month" ? "Monthly" : "Annual"}
        </button>
      ))}
    </div>
  );
}

export function PricingSection() {
  const [interval, setBillingInterval] = useState<BillingInterval>("month");
  const archive = PLAN_CATALOGUE.archive;
  const archivePrice = formatPrice(archive, interval);

  return (
    <section className="max-w-5xl mx-auto px-6 py-20" id="pricing">
      <h2 className="font-display text-3xl text-center mb-3" style={{ color: "var(--text-primary)" }}>
        Simple pricing for every stage of your podcast.
      </h2>
      <p className="text-sm text-center mb-8 max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
        Start free, archive finished shows affordably, and upgrade when you&apos;re actively publishing.
      </p>

      <div className="flex justify-center mb-10">
        <BillingToggle interval={interval} onChange={setBillingInterval} />
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        {ACTIVE_PLANS.map((key) => {
          const plan = PLAN_CATALOGUE[key];
          const price = formatPrice(plan, interval);
          const highlight = key === "pro";
          return (
            <div
              key={key}
              className="public-panel rounded-sm p-5 flex flex-col"
              style={highlight ? { borderColor: "rgba(204,0,0,0.4)" } : {}}
            >
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display text-sm" style={{ color: "var(--text-body)" }}>{plan.label}</span>
                  {highlight && (
                    <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {price.amount}
                  <span className="text-sm font-normal" style={{ color: "var(--text-faint)" }}>{price.period}</span>
                </p>
                <p className="text-[11px] mt-1 min-h-[2.5em]" style={{ color: "var(--text-faint)" }}>
                  {plan.descriptor}
                </p>
              </div>

              <ul className="space-y-2 text-xs flex-1 mb-5" style={{ color: "var(--text-muted)" }}>
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-1.5">
                    <CheckCircle2
                      className="h-3 w-3 shrink-0"
                      style={{ color: highlight ? "var(--accent)" : "var(--border-muted)" }}
                    />
                    {feat}
                  </li>
                ))}
              </ul>

              <Link
                href={CTA[key].href}
                className="text-center text-xs font-medium py-2 px-3 rounded-sm transition-colors"
                style={
                  highlight
                    ? { background: "var(--accent)", color: "#ffffff" }
                    : { background: "var(--bg-raised)", color: "var(--text-body)", border: "1px solid var(--border-subtle)" }
                }
              >
                {CTA[key].label}
              </Link>
            </div>
          );
        })}
      </div>

      {/* Archive — a separate use case from active publishing */}
      <div className="public-panel rounded-sm p-5 mt-6 flex flex-col md:flex-row md:items-center gap-4">
        <div
          className="h-10 w-10 rounded-sm flex items-center justify-center shrink-0"
          style={{ background: "var(--bg-raised)" }}
        >
          <Archive className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
        </div>
        <div className="flex-1">
          <p className="font-display text-sm mb-1" style={{ color: "var(--text-body)" }}>
            Archive{" "}
            <span className="font-bold" style={{ color: "var(--text-primary)" }}>
              {archivePrice.amount}
              <span className="font-normal" style={{ color: "var(--text-faint)" }}>{archivePrice.period}</span>
            </span>
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Finished or paused your show? Keep your existing catalogue and feed live for 1 podcast — no new uploads.
          </p>
        </div>
        <Link
          href="/auth/register"
          className="text-center text-xs font-medium py-2 px-4 rounded-sm transition-colors shrink-0"
          style={{ background: "var(--bg-raised)", color: "var(--text-body)", border: "1px solid var(--border-subtle)" }}
        >
          Archive a show
        </Link>
      </div>

      <p className="text-xs text-center mt-6" style={{ color: "var(--text-faint)" }}>
        Pay annually and get 2 months free.
      </p>
    </section>
  );
}
