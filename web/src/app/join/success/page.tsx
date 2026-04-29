import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default async function JoinSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ test?: string }>;
}) {
  const { test } = await searchParams;
  const isTest = test === "1";

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg-canvas)" }}>
      <div className="max-w-sm w-full text-center space-y-6">
        {isTest && (
          <div className="rounded-sm px-4 py-2 text-xs font-bold uppercase tracking-widest" style={{ background: "rgba(168,85,247,0.15)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.3)" }}>
            Test mode — no real charge was made
          </div>
        )}

        <CheckCircle2 className="h-12 w-12 mx-auto text-green-400" />

        <div>
          <h1 className="font-display text-2xl mb-2" style={{ color: "var(--text-primary)" }}>
            {isTest ? "Test complete!" : "You\u2019re all set!"}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {isTest
              ? "The test checkout flow worked end-to-end. No real payment was processed."
              : "Your subscription is active. You can now cancel your old podcast host. Sign in to access your Freedom Podcasting dashboard."}
          </p>
        </div>

        {!isTest && (
          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="block w-full text-center px-6 py-3 rounded-sm font-medium text-white text-sm transition-opacity hover:opacity-90"
              style={{ background: "var(--accent)" }}
            >
              Sign In to Your Dashboard
            </Link>
            <Link
              href="/auth/register"
              className="block w-full text-center px-6 py-3 rounded-sm text-sm transition-colors public-panel"
              style={{ color: "var(--text-muted)" }}
            >
              Create an Account
            </Link>
          </div>
        )}

        <p className="text-xs" style={{ color: "var(--text-faint)" }}>
          Questions? Email us at{" "}
          <a href="mailto:ian@freedompodcasting.com" className="underline">
            ian@freedompodcasting.com
          </a>
        </p>
      </div>
    </div>
  );
}
