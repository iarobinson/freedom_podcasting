import { clsx } from "clsx";

interface BadgeProps { variant?: "default" | "success" | "warning" | "error" | "info"; children: React.ReactNode; className?: string; }

export function Badge({ variant = "default", children, className }: BadgeProps) {
  const variants = {
    default: "bg-white/8 text-ink-300 border-white/10",
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    error:   "bg-red-500/15 text-red-400 border-red-500/20",
    info:    "bg-brand-500/15 text-brand-300 border-brand-500/20",
  };
  return (
    <span className={clsx("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", variants[variant], className)}>
      {children}
    </span>
  );
}
