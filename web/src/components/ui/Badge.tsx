import { clsx } from "clsx";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "error" | "info";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span className={clsx(
      "badge",
      variant === "default"  && "badge-default",
      variant === "success"  && "badge-live",
      variant === "warning"  && "badge-warning",
      variant === "error"    && "badge-live",
      variant === "info"     && "badge-info",
      className
    )}>
      {children}
    </span>
  );
}
