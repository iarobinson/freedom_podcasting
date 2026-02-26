"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mic2, ArrowRight } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const router   = useRouter();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "", password_confirmation: "" });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.password_confirmation) { setError("Passwords don't match."); return; }
    setLoading(true);
    try {
      await authApi.register(form);
      await login(form.email, form.password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors?.[0];
      setError(msg ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="w-full max-w-sm animate-fade-up">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 shadow-lg shadow-brand-500/30">
            <Mic2 className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-xl text-ink-100">FreedomPodcasting</span>
        </div>

        <div className="glass rounded-2xl p-8">
          <h1 className="font-display text-2xl text-ink-100 mb-1">Start creating</h1>
          <p className="text-sm text-ink-500 mb-6">Your podcast studio awaits</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First name" placeholder="Jane" value={form.first_name} onChange={set("first_name")} required />
              <Input label="Last name"  placeholder="Doe"  value={form.last_name}  onChange={set("last_name")}  required />
            </div>
            <Input label="Email"    type="email"    placeholder="you@example.com" value={form.email}    onChange={set("email")}    required />
            <Input label="Password" type="password" placeholder="8+ characters"   value={form.password} onChange={set("password")} required minLength={8} />
            <Input label="Confirm password" type="password" placeholder="••••••••" value={form.password_confirmation} onChange={set("password_confirmation")} required />

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">{error}</div>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Create account <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-ink-600 mt-5">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
