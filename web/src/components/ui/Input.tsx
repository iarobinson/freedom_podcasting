import { clsx } from "clsx";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-ink-300">{label}</label>}
      <input
        ref={ref}
        className={clsx(
          "w-full rounded-lg px-3.5 py-2.5 text-sm bg-white/5 border text-ink-100 placeholder:text-ink-600",
          "focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/60 transition-all",
          error ? "border-red-500/50 bg-red-500/5" : "border-white/10 hover:border-white/20",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-ink-500">{hint}</p>}
    </div>
  )
);
Input.displayName = "Input";
