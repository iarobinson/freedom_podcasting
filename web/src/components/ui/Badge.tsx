import { clsx } from "clsx";

// Semantic colors: live = red (publishing), success = green, warning = gold,
// info = blue (in-progress workflow), default = gray (drafts, inactive).
interface BadgeProps {
  variant?: "default" | "live" | "success" | "warning" | "error" | "info";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span className={clsx(
      "badge",
      variant === "default"  && "badge-default",
      variant === "live"     && "badge-live",
      variant === "success"  && "badge-success",
      variant === "warning"  && "badge-warning",
      variant === "error"    && "badge-live",
      variant === "info"     && "badge-info",
      className
    )}>
      {children}
    </span>
  );
}
