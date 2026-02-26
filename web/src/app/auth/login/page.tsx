"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Radio } from "lucide-react";

export default function LoginPage() {
  const router  = useRouter();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(form.email, form.password);
      router.push("/dashboard");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4">
      {/* Ancient engraving background element */}
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
        {/* Logo mark */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-12 w-12 border border-accent mb-4">
            <Radio className="h-5 w-5 text-accent" />
          </div>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-accent">Freedom Podcasting</p>
          <h1 className="text-xl font-bold uppercase tracking-widest text-ink-100 mt-1">Sign In</h1>
          <hr className="accent-rule mt-3 mx-auto w-16" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="panel p-6 space-y-4">
            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
            />
            {error && (
              <p className="text-[11px] text-accent uppercase tracking-wide">{error}</p>
            )}
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign In
            </Button>
          </div>
        </form>

        <p className="text-center text-[11px] text-ink-600 mt-6 uppercase tracking-widest">
          No account?{" "}
          <Link href="/auth/register" className="text-ink-400 hover:text-accent transition-colors">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
