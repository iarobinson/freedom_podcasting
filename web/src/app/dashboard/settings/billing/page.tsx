"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, CheckCircle2, Zap } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { billingApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BillingToggle } from "@/components/marketing/PricingSection";
import { ACTIVE_PLANS, PLAN_CATALOGUE, formatPrice, formatBytes, type BillingInterval } from "@/lib/plans";
import { toast } from "@/lib/toast";
import type { Plan, UsageMeter } from "@/types";

// Upgrade order. Archive sits between Free and Starter.
const PLAN_ORDER: Plan[] = ["free", "archive", "starter", "pro", "agency"];

function Meter({ label, meter, format = String }: { label: string; meter?: UsageMeter; format?: (n: number) => string }) {
  const unlimited = meter?.limit === -1;
  const pct = meter && !unlimited && meter.limit > 0 ? Math.min(100, (meter.used / meter.limit) * 100) : 0;
  return (
    <div>
      <p className="text-[10px] text-ink-600 uppercase tracking-widest font-bold mb-1">{label}</p>
      <p className="text-sm text-ink-200 mb-1.5">
        {meter ? format(meter.used) : "—"}
        <span className="text-ink-600"> / {meter ? (unlimited ? "Unlimited" : format(meter.limit)) : "—"}</span>
      </p>
      <div className="h-1 bg-ink-800">
        <div className={pct >= 90 ? "h-full bg-accent" : "h-full bg-ink-500"} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function BillingPage() {
  const { currentOrg, fetchMe } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [interval, setBillingInterval] = useState<BillingInterval>("month");

  const { data: summary } = useQuery({
    queryKey: ["billing-summary", currentOrg?.slug, currentOrg?.plan],
    queryFn: () => billingApi.summary(currentOrg!.slug).then((r) => r.data.data),
    enabled: !!currentOrg,
  });

  // Default the toggle to the cycle the org is already on
  useEffect(() => {
    if (summary?.billing_interval) setBillingInterval(summary.billing_interval);
  }, [summary?.billing_interval]);

  // Handle return from Stripe Checkout or Customer Portal
  useEffect(() => {
    const isCheckout = searchParams.get("success") === "true";
    const isPortal   = searchParams.get("portal_return") === "true";
    if (!isCheckout && !isPortal) return;

    router.replace("/dashboard/settings/billing");
    if (isCheckout) toast.success("Plan upgraded!", "Your new plan is now active.");

    // Poll fetchMe until plan stabilises (webhook may not have fired yet)
    let attempts = 0;
    const poll = () => {
      fetchMe().catch(() => {}).finally(() => {
        attempts++;
        queryClient.invalidateQueries({ queryKey: ["billing-summary"] });
        if (attempts < 6) setTimeout(poll, 1500);
      });
    };
    setTimeout(poll, 500);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpgrade = async (plan: Plan) => {
    if (!currentOrg) return;
    setLoadingPlan(plan);
    try {
      const res = await billingApi.checkout(currentOrg.slug, plan, interval);
      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        // Existing subscription updated directly — refresh org data
        await fetchMe();
        queryClient.invalidateQueries({ queryKey: ["billing-summary"] });
        toast.success("Plan updated!", "Your new plan is now active.");
        setLoadingPlan(null);
      }
    } catch {
      toast.error("Could not start checkout", "Please try again.");
      setLoadingPlan(null);
    }
  };

  const handlePortal = async () => {
    if (!currentOrg) return;
    setPortalLoading(true);
    try {
      const res = await billingApi.portal(currentOrg.slug);
      window.location.href = res.data.url;
    } catch {
      toast.error("Could not open billing portal", "Please try again.");
      setPortalLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!currentOrg) return;
    if (!confirm("Cancel your subscription and revert to the Free plan?")) return;
    setCancelLoading(true);
    try {
      await billingApi.cancel(currentOrg.slug);
      await fetchMe();
      queryClient.invalidateQueries({ queryKey: ["billing-summary"] });
      toast.success("Subscription cancelled", "You've been moved to the Free plan.");
    } catch {
      toast.error("Could not cancel subscription", "Please try again.");
    } finally {
      setCancelLoading(false);
    }
  };

  const currentPlan     = currentOrg?.plan ?? "free";
  const currentInterval = summary?.billing_interval ?? "month";
  const currentIndex    = PLAN_ORDER.indexOf(currentPlan);
  const isPaid          = currentPlan !== "free";

  const actionFor = (plan: Plan) => {
    if (plan === currentPlan) {
      if (plan === "free" || interval === currentInterval) return "current";
      return "switch-interval";
    }
    if (plan === "free") return "cancel";
    return PLAN_ORDER.indexOf(plan) > currentIndex ? "upgrade" : "downgrade";
  };

  const renderAction = (plan: Plan) => {
    const action = actionFor(plan);
    if (action === "current") {
      return <div className="text-center text-[10px] text-ink-600 uppercase tracking-widest py-1.5">Your plan</div>;
    }
    if (action === "cancel") {
      return (
        <Button size="sm" variant="ghost" loading={cancelLoading} onClick={handleCancel} className="w-full text-ink-500">
          Cancel plan
        </Button>
      );
    }
    const label = action === "upgrade" ? "Upgrade"
      : action === "switch-interval" ? (interval === "year" ? "Switch to annual" : "Switch to monthly")
      : "Downgrade";
    return (
      <Button
        size="sm"
        variant={action === "upgrade" ? "primary" : "secondary"}
        loading={loadingPlan === plan}
        onClick={() => handleUpgrade(plan)}
        className="w-full">
        {action === "upgrade" && <Zap className="h-3 w-3" />} {label}
      </Button>
    );
  };

  const archive = PLAN_CATALOGUE.archive;
  const archivePrice = formatPrice(archive, interval);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl text-ink-100 mb-1">Billing</h1>
        <p className="text-sm text-ink-500">Your plan, usage, and subscription</p>
      </div>

      {/* Current billing summary */}
      <div className="glass rounded-2xl p-6 mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <p className="text-[10px] text-ink-600 uppercase tracking-widest font-bold mb-1">Current plan</p>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl text-ink-100">{PLAN_CATALOGUE[currentPlan].label}</span>
              <Badge variant={isPaid ? "success" : "default"}>{isPaid ? "Active" : "Free"}</Badge>
            </div>
            <p className="text-xs text-ink-500 mt-1">{PLAN_CATALOGUE[currentPlan].descriptor}</p>
            {isPaid && (
              <p className="text-xs text-ink-500 mt-2">
                Billed {currentInterval === "year" ? "annually" : "monthly"}
                {summary?.renews_at && <> · Renews {new Date(summary.renews_at).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</>}
              </p>
            )}
          </div>
          {isPaid && (
            <Button variant="secondary" size="sm" loading={portalLoading} onClick={handlePortal}>
              Manage billing
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Meter label="Podcasts"     meter={summary?.usage.podcasts} />
          <Meter label="Team members" meter={summary?.usage.members} />
          <Meter label="Storage"      meter={summary?.usage.storage_bytes} format={formatBytes} />
        </div>
      </div>

      <div className="flex items-end justify-between gap-4 flex-wrap mb-4">
        <div>
          <h2 className="font-display text-lg text-ink-100">Plans</h2>
          <p className="text-xs text-ink-500">Upgrade instantly to unlock higher limits and more active podcasts.</p>
        </div>
        <div className="text-right">
          <BillingToggle interval={interval} onChange={setBillingInterval} />
          <p className="text-[10px] text-ink-600 mt-1.5">Pay annually and get 2 months free.</p>
        </div>
      </div>

      {/* Active publishing plans */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {ACTIVE_PLANS.map((key) => {
          const plan = PLAN_CATALOGUE[key];
          const price = formatPrice(plan, interval);
          const isCurrent = actionFor(key) === "current";
          return (
            <div key={key} className={`glass rounded-2xl p-5 flex flex-col ${isCurrent ? "border border-accent/40" : ""}`}>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display text-sm text-ink-200">{plan.label}</span>
                  {isCurrent && <span className="text-[9px] font-bold uppercase tracking-widest text-accent">Current</span>}
                </div>
                <p className="text-xl font-bold text-ink-100">
                  {price.amount}<span className="text-xs font-normal text-ink-600">{price.period}</span>
                </p>
                <p className="text-[11px] text-ink-500 mt-1 min-h-[2.5em]">{plan.descriptor}</p>
              </div>

              <ul className="space-y-2 text-xs text-ink-500 flex-1 mb-5">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-ink-700 shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>

              {renderAction(key)}
            </div>
          );
        })}
      </div>

      {/* Archive — separate use case */}
      <div className={`glass rounded-2xl p-5 mt-4 flex flex-col md:flex-row md:items-center gap-4 ${actionFor("archive") === "current" ? "border border-accent/40" : ""}`}>
        <div className="h-10 w-10 bg-ink-800 flex items-center justify-center shrink-0">
          <Archive className="h-5 w-5 text-ink-400" />
        </div>
        <div className="flex-1">
          <p className="font-display text-sm text-ink-200">
            {archive.label}{" "}
            <span className="font-bold text-ink-100">{archivePrice.amount}<span className="font-normal text-ink-600">{archivePrice.period}</span></span>
          </p>
          <p className="text-xs text-ink-500">
            {archive.descriptor}. Keeps 1 podcast&apos;s existing catalogue and feed live — no new uploads or publishing.
          </p>
        </div>
        <div className="md:w-40 shrink-0">{renderAction("archive")}</div>
      </div>
    </div>
  );
}
