import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className, children, disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 font-body font-bold uppercase tracking-widest transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed border";
    const sizes = {
      sm: "px-3 py-1.5 text-[10px]",
      md: "px-4 py-2 text-[11px]",
      lg: "px-6 py-3 text-xs",
    };
    const variants = {
      primary:   "bg-accent border-accent text-white hover:bg-accent-light hover:border-accent-light active:bg-accent-dark",
      secondary: "bg-transparent border-ink-700 text-ink-300 hover:border-ink-500 hover:text-ink-100 hover:bg-ink-800",
      ghost:     "bg-transparent border-transparent text-ink-400 hover:text-ink-200 hover:bg-ink-800",
      danger:    "bg-transparent border-red-800 text-red-400 hover:bg-red-900/20 hover:border-red-600",
    };
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(base, sizes[size], variants[variant], className)}
        {...props}
      >
        {loading ? (
          <>
            <span className="h-3 w-3 border border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading</span>
          </>
        ) : children}
      </button>
    );
  }
);
Button.displayName = "Button";
