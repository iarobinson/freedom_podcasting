import { clsx } from "clsx";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({ variant = "primary", size = "md", loading, className, children, disabled, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none";
  const variants = {
    primary:   "bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/20 active:scale-[0.98]",
    secondary: "glass glass-hover text-ink-200 hover:text-ink-100",
    ghost:     "text-ink-400 hover:text-ink-200 hover:bg-white/5",
    danger:    "bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20",
  };
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };

  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
