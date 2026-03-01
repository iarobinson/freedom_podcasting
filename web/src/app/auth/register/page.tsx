"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { authApi } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Radio } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "", password_confirmation: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) { setError("Passwords do not match."); return; }
    setError(""); setLoading(true);
    try {
      await authApi.register(form);
      await login(form.email, form.password);
      router.push("/dashboard");
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

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-12 w-12 border border-accent mb-4">
            <Radio className="h-5 w-5 text-accent" />
          </div>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-accent">Freedom Podcasting</p>
          <h1 className="text-xl font-bold uppercase tracking-widest text-ink-100 mt-1">Create Account</h1>
          <hr className="accent-rule mt-3 mx-auto w-16" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="panel p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First Name" value={form.first_name} onChange={set("first_name")} required />
              <Input label="Last Name"  value={form.last_name}  onChange={set("last_name")}  required />
            </div>
            <Input label="Email Address" type="email" value={form.email} onChange={set("email")} required />
            <Input label="Password" type="password" value={form.password} onChange={set("password")} required />
            <Input label="Confirm Password" type="password" value={form.password_confirmation} onChange={set("password_confirmation")} required />
            {error && <p className="text-[11px] text-accent uppercase tracking-wide">{error}</p>}
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Create Account
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
    </div>
  );
}
