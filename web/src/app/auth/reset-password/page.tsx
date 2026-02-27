"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Radio } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("reset_password_token") ?? "";

  const [form, setForm] = useState({ password: "", password_confirmation: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      setError("Passwords do not match.");
      return;
    }
    setError(""); setLoading(true);
    try {
      await authApi.resetPassword(token, form.password, form.password_confirmation);
      router.push("/auth/login?reset=1");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string; errors?: string[] } } };
      const msg = axiosErr.response?.data?.error
        ?? axiosErr.response?.data?.errors?.join(", ")
        ?? "Reset failed. The link may have expired.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="panel p-6 text-center space-y-3">
        <p className="text-accent text-sm uppercase tracking-wide">Invalid reset link.</p>
        <p className="text-[11px] text-ink-500 uppercase tracking-widest">
          Request a new one from the{" "}
          <Link href="/auth/forgot-password" className="text-ink-400 hover:text-accent transition-colors">
            forgot password
          </Link>{" "}
          page.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="panel p-6 space-y-4">
        <Input
          label="New Password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={set("password")}
          required
        />
        <Input
          label="Confirm New Password"
          type="password"
          autoComplete="new-password"
          value={form.password_confirmation}
          onChange={set("password_confirmation")}
          required
        />
        {error && (
          <p className="text-[11px] text-accent uppercase tracking-wide">{error}</p>
        )}
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Set New Password
        </Button>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute right-0 top-0 opacity-[0.03] w-[600px] h-[600px]" viewBox="0 0 400 400" fill="none">
          <circle cx="200" cy="200" r="180" stroke="white" strokeWidth="0.5"/>
          <circle cx="200" cy="200" r="140" stroke="white" strokeWidth="0.5"/>
          <circle cx="200" cy="200" r="100" stroke="white" strokeWidth="0.5"/>
          <circle cx="200" cy="200" r="60" stroke="white" strokeWidth="0.5"/>
          <line x1="20" y1="200" x2="380" y2="200" stroke="white" strokeWidth="0.5"/>
          <line x1="200" y1="20" x2="200" y2="380" stroke="white" strokeWidth="0.5"/>
          <line x1="74" y1="74" x2="326" y2="326" stroke="white" strokeWidth="0.5"/>
          <line x1="326" y1="74" x2="74" y2="326" stroke="white" strokeWidth="0.5"/>
        </svg>
        <svg className="absolute left-0 bottom-0 opacity-[0.03] w-[400px] h-[400px]" viewBox="0 0 300 300" fill="none">
          <circle cx="150" cy="150" r="130" stroke="white" strokeWidth="0.5"/>
          <circle cx="150" cy="150" r="90" stroke="white" strokeWidth="0.5"/>
          <circle cx="150" cy="150" r="50" stroke="white" strokeWidth="0.5"/>
        </svg>
      </div>

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-12 w-12 border border-accent mb-4">
            <Radio className="h-5 w-5 text-accent" />
          </div>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-accent">Freedom Podcasting</p>
          <h1 className="text-xl font-bold uppercase tracking-widest text-ink-100 mt-1">New Password</h1>
          <hr className="accent-rule mt-3 mx-auto w-16" />
        </div>

        <Suspense fallback={<div className="panel p-6 shimmer-bg h-40" />}>
          <ResetPasswordForm />
        </Suspense>

        <p className="text-center text-[11px] text-ink-600 mt-6 uppercase tracking-widest">
          <Link href="/auth/login" className="text-ink-400 hover:text-accent transition-colors">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
