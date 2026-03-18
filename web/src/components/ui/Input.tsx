import { InputHTMLAttributes, forwardRef, useState } from "react";
import { clsx } from "clsx";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-500">
            {label}
          </label>
        )}
        <div className={isPassword ? "relative" : undefined}>
          <input
            ref={ref}
            type={inputType}
            className={clsx(
              "w-full px-3 py-2.5 text-sm font-body",
              "bg-ink-900 border text-ink-100",
              "placeholder-ink-600",
              "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30",
              "transition-colors duration-150",
              "rounded-none",
              error ? "border-red-700" : "border-ink-700",
              isPassword && "pr-10",
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-600 hover:text-ink-400 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="text-[10px] text-red-400 uppercase tracking-wide">{error}</p>
        )}
        {hint && !error && (
          <p className="text-[10px] text-ink-600">{hint}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
