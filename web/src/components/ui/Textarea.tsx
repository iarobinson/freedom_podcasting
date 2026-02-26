import { TextareaHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, ...props }, ref) => (
    <div className="space-y-1">
      {label && (
        <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-500">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={clsx(
          "w-full px-3 py-2.5 text-sm font-body resize-y min-h-[80px]",
          "bg-ink-900 border text-ink-100",
          "placeholder-ink-600",
          "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30",
          "transition-colors duration-150 rounded-none",
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
Textarea.displayName = "Textarea";
