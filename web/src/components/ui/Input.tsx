import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => (
    <div className="space-y-1">
      {label && (
        <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-500">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={clsx(
          "w-full px-3 py-2.5 text-sm font-body",
          "bg-ink-900 border text-ink-100",
          "placeholder-ink-600",
          "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30",
          "transition-colors duration-150",
          "rounded-none", // Sharp corners match the aesthetic
          error ? "border-red-700" : "border-ink-700",
          className
        )}
        {...props}
      />
      {error && <p className="text-[10px] text-red-400 uppercase tracking-wide">{error}</p>}
      {hint && !error && <p className="text-[10px] text-ink-600">{hint}</p>}
    </div>
  )
);
Input.displayName = "Input";
