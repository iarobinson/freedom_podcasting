"use client";
import { useState } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Radio } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-xl font-bold uppercase tracking-widest text-ink-100 mt-1">Reset Password</h1>
          <hr className="accent-rule mt-3 mx-auto w-16" />
        </div>

        {submitted ? (
          <div className="panel p-6 text-center space-y-3">
            <p className="text-ink-200 text-sm leading-relaxed">
              If that email is registered, a reset link is on its way. Check your inbox.
            </p>
            <p className="text-[11px] text-ink-600 uppercase tracking-widest">
              Didn&apos;t get it? Check your spam folder.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="panel p-6 space-y-4">
              <p className="text-[11px] text-ink-500 uppercase tracking-wider">
                Enter your email and we&apos;ll send a reset link.
              </p>
              <Input
                label="Email Address"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {error && (
                <p className="text-[11px] text-accent uppercase tracking-wide">{error}</p>
              )}
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Send Reset Link
              </Button>
            </div>
          </form>
        )}

        <p className="text-center text-[11px] text-ink-600 mt-6 uppercase tracking-widest">
          <Link href="/auth/login" className="text-ink-400 hover:text-accent transition-colors">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
