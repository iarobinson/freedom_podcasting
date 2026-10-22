import type { Plan } from "@/types";

export type BillingInterval = "month" | "year";

export interface PlanInfo {
  key: Plan;
  label: string;
  descriptor: string;
  monthly: number;
  annual: number;
  features: string[];
}

// Single source of truth for plan presentation — homepage and billing page.
// Limits must match Organization::PLAN_LIMITS in the API.
export const PLAN_CATALOGUE: Record<Plan, PlanInfo> = {
  free: {
    key: "free", label: "Free", descriptor: "For testing or starting a new show",
    monthly: 0, annual: 0,
    features: ["1 podcast", "1 publish/month", "1 member", "3 GB storage", "AI à la carte"],
  },
  archive: {
    key: "archive", label: "Archive", descriptor: "For keeping finished shows online",
    monthly: 5, annual: 50,
    features: ["1 podcast", "No new uploads", "Keep your existing catalogue live", "Great for paused or completed shows"],
  },
  starter: {
    key: "starter", label: "Starter", descriptor: "For active independent creators",
    monthly: 10, annual: 100,
    features: ["3 podcasts", "Unlimited episodes", "3 members", "15 GB storage", "AI show notes included"],
  },
  pro: {
    key: "pro", label: "Pro", descriptor: "For growing teams and networks",
    monthly: 49, annual: 490,
    features: ["10 podcasts", "Unlimited episodes", "10 members", "50 GB storage", "AI show notes included"],
  },
  agency: {
    key: "agency", label: "Agency", descriptor: "For larger teams and client organizations",
    monthly: 99, annual: 990,
    features: ["Unlimited podcasts", "Unlimited episodes", "Unlimited members", "200 GB storage", "AI show notes included"],
  },
};

// Active publishing tiers, in upgrade order. Archive is a separate use case.
export const ACTIVE_PLANS: Plan[] = ["free", "starter", "pro", "agency"];

export function formatPrice(plan: PlanInfo, interval: BillingInterval) {
  if (plan.monthly === 0) return { amount: "$0", period: "" };
  return interval === "year"
    ? { amount: `$${plan.annual}`, period: "/yr" }
    : { amount: `$${plan.monthly}`, period: "/mo" };
}

// Mirrors Organization#ai_included? — Free and Archive buy AI per episode.
export const aiIncluded = (plan?: Plan) => !!plan && plan !== "free" && plan !== "archive";

export function formatBytes(bytes: number) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 ** 2) return `${Math.round(bytes / 1024 ** 2)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}
