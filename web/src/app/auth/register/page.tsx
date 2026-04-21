"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { authApi } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

function RegisterForm() {
  const params = useSearchParams();

  const invitationToken = params.get("invitation_token") ?? "";
  const prefillEmail    = params.get("email") ?? "";
  const next            = params.get("next") ?? "";

  const [form, setForm] = useState({
    first_name: "", last_name: "",
    email: prefillEmail, password: "", password_confirmation: "",
  });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) { setError("Passwords do not match."); return; }
    setError(""); setLoading(true);
    try {
      await authApi.register({ ...form, invitation_token: invitationToken || undefined });
      // Fire GA4 conversion event — Google Ads tracks this as a signup
      if (typeof window !== "undefined" && typeof (window as unknown as { gtag?: Function }).gtag === "function") {
        (window as unknown as { gtag: Function }).gtag("event", "sign_up", { method: "email" });
      }
      setDone(true);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { errors?: string[]; message?: string } } };
      const msg = axiosErr.response?.data?.errors?.join(", ")
        ?? axiosErr.response?.data?.message
        ?? "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  if (done) {
    return (
      <div className="w-full max-w-sm relative text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
            <MailCheck className="h-7 w-7 text-green-400" />
          </div>
        </div>
        <div>
          <h1 className="text-xl font-bold uppercase tracking-widest text-ink-100">Check your inbox</h1>
          <hr className="accent-rule mt-3 mx-auto w-16" />
        </div>
        <p className="text-sm text-ink-400">
          We sent a confirmation link to <span className="text-ink-200">{form.email}</span>.
          Click it to verify your account, then sign in.
        </p>
        <Link
          href={next ? `/auth/login?next=${encodeURIComponent(next)}` : "/auth/login"}
          className="btn btn-primary w-full block text-center py-2.5"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm relative">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center h-12 w-12 mb-4 overflow-hidden">
          <Logo size={48} />
        </div>
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-accent">Freedom Podcasting</p>
        <h1 className="text-xl font-bold uppercase tracking-widest text-ink-100 mt-1">
          {invitationToken ? "Create Account to Join" : "Create Account"}
        </h1>
        <hr className="accent-rule mt-3 mx-auto w-16" />
      </div>

      {invitationToken && (
        <div className="panel p-3 mb-4 text-center">
          <p className="text-[11px] text-ink-500 uppercase tracking-widest">
            Your invitation will be accepted automatically after account creation.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="panel p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" value={form.first_name} onChange={set("first_name")} required />
            <Input label="Last Name"  value={form.last_name}  onChange={set("last_name")}  required />
          </div>
          <Input
            label="Email Address" type="email"
            value={form.email} onChange={set("email")}
            required readOnly={!!prefillEmail}
          />
          <Input label="Password" type="password" value={form.password} onChange={set("password")} required />
          <Input label="Confirm Password" type="password" value={form.password_confirmation} onChange={set("password_confirmation")} required />
          {error && <p className="text-[11px] text-accent uppercase tracking-wide">{error}</p>}
          <Button type="submit" loading={loading} className="w-full" size="lg">
            {invitationToken ? "Create Account & Join" : "Create Account"}
          </Button>
        </div>
      </form>

      <p className="text-center text-[11px] text-ink-600 mt-6 uppercase tracking-widest">
        Have an account?{" "}
        <Link href="/auth/login" className="text-ink-400 hover:text-accent transition-colors">
          Sign In
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute right-0 top-0 opacity-[0.03] w-[600px] h-[600px]" viewBox="0 0 400 400" fill="none">
          <circle cx="200" cy="200" r="180" stroke="white" strokeWidth="0.5"/>
          <circle cx="200" cy="200" r="140" stroke="white" strokeWidth="0.5"/>
          <circle cx="200" cy="200" r="100" stroke="white" strokeWidth="0.5"/>
          <line x1="20" y1="200" x2="380" y2="200" stroke="white" strokeWidth="0.5"/>
          <line x1="200" y1="20" x2="200" y2="380" stroke="white" strokeWidth="0.5"/>
        </svg>
      </div>
      <Suspense fallback={null}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
