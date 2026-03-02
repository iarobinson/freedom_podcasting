"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Zap } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { billingApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "@/lib/toast";
import type { Plan } from "@/types";

interface Tier {
  key: Plan;
  label: string;
  price: string;
  podcasts: string;
  episodes: string;
  members: string;
  storage: string;
}

const TIERS: Tier[] = [
  { key: "free",    label: "Free",    price: "$0/mo",   podcasts: "1",         episodes: "1/month",   members: "1",         storage: "3 GB"   },
  { key: "starter", label: "Starter", price: "$10/mo",  podcasts: "3",         episodes: "Unlimited", members: "3",         storage: "15 GB"  },
  { key: "pro",     label: "Pro",     price: "$49/mo",  podcasts: "10",        episodes: "Unlimited", members: "10",        storage: "50 GB"  },
  { key: "agency",  label: "Agency",  price: "$99/mo",  podcasts: "Unlimited", episodes: "Unlimited", members: "Unlimited", storage: "200 GB" },
];

const PLAN_ORDER: Plan[] = ["free", "starter", "pro", "agency"];

export default function BillingPage() {
  const { currentOrg, fetchMe } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  // Handle return from Stripe Checkout
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Plan upgraded!", "Your new plan is now active.");
      fetchMe().catch(() => {});
      // Remove ?success param without re-render
      router.replace("/dashboard/settings/billing");
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpgrade = async (plan: Plan) => {
    if (!currentOrg) return;
    setLoadingPlan(plan);
    try {
      const res = await billingApi.checkout(currentOrg.slug, plan);
      window.location.href = res.data.url;
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

  const currentPlanIndex = PLAN_ORDER.indexOf(currentOrg?.plan ?? "free");
  const isPaid = currentOrg?.plan !== "free";

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl text-ink-100 mb-1">Billing</h1>
        <p className="text-sm text-ink-500">Manage your subscription and plan limits</p>
      </div>

      {/* Current plan summary */}
      <div className="glass rounded-2xl p-6 mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs text-ink-600 uppercase tracking-widest font-bold mb-1">Current Plan</p>
          <div className="flex items-center gap-2">
            <span className="font-display text-xl text-ink-100 capitalize">{currentOrg?.plan ?? "free"}</span>
            <Badge variant={isPaid ? "success" : "default"}>{isPaid ? "Active" : "Free"}</Badge>
          </div>
        </div>
        {isPaid && (
          <Button variant="secondary" size="sm" loading={portalLoading} onClick={handlePortal}>
            Manage Billing
          </Button>
        )}
      </div>

      {/* Plan comparison grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TIERS.map((tier, i) => {
          const isCurrent = currentOrg?.plan === tier.key;
          const isUpgrade = i > currentPlanIndex;

          return (
            <div key={tier.key} className={`glass rounded-2xl p-5 flex flex-col ${isCurrent ? "border border-accent/40" : ""}`}>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display text-sm text-ink-200">{tier.label}</span>
                  {isCurrent && <span className="text-[9px] font-bold uppercase tracking-widest text-accent">Current</span>}
                </div>
                <p className="text-xl font-bold text-ink-100">{tier.price}</p>
              </div>

              <ul className="space-y-2 text-xs text-ink-500 flex-1 mb-5">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-ink-700 shrink-0" />
                  {tier.podcasts} podcast{tier.podcasts === "1" ? "" : "s"}
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-ink-700 shrink-0" />
                  {tier.episodes} episode{tier.episodes === "1/month" ? "" : "s"}
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-ink-700 shrink-0" />
                  {tier.members} member{tier.members === "1" ? "" : "s"}
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-ink-700 shrink-0" />
                  {tier.storage} storage
                </li>
              </ul>

              {isCurrent ? (
                <div className="text-center text-[10px] text-ink-700 uppercase tracking-widest py-1">
                  Your plan
                </div>
              ) : isUpgrade ? (
                <Button
                  size="sm"
                  variant="primary"
                  loading={loadingPlan === tier.key}
                  onClick={() => handleUpgrade(tier.key)}
                  className="w-full">
                  <Zap className="h-3 w-3" /> Upgrade
                </Button>
              ) : (
                <div className="text-center text-[10px] text-ink-700 uppercase tracking-widest py-1">
                  Downgrade via portal
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
