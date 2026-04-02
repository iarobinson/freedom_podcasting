"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { authApi } from "@/lib/api";
import { Logo } from "@/components/ui/Logo";

function VerifyEmailContent() {
  const params = useSearchParams();
  const token  = params.get("token") ?? "";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setMessage("No confirmation token found."); return; }
    authApi.confirmEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
          ?? "Something went wrong. Please try again.";
        setMessage(msg);
        setStatus("error");
      });
  }, [token]);

  return (
    <div className="w-full max-w-sm text-center space-y-6">
      <div className="flex justify-center">
        <Logo size={40} />
      </div>

      {status === "loading" && (
        <>
          <Loader2 className="h-10 w-10 text-ink-500 animate-spin mx-auto" />
          <p className="text-sm text-ink-500">Confirming your email…</p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-green-400" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold uppercase tracking-widest text-ink-100">Email confirmed</h1>
            <hr className="accent-rule mt-3 mx-auto w-16" />
          </div>
          <p className="text-sm text-ink-400">Your email address has been verified. You&apos;re all set.</p>
          <Link href="/dashboard" className="btn btn-primary w-full block text-center py-2.5">
            Go to Dashboard
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <XCircle className="h-7 w-7 text-accent" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold uppercase tracking-widest text-ink-100">Verification failed</h1>
            <hr className="accent-rule mt-3 mx-auto w-16" />
          </div>
          <p className="text-sm text-ink-400">{message}</p>
          <Link href="/dashboard" className="btn btn-secondary w-full block text-center py-2.5">
            Go to Dashboard
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4">
      <Suspense fallback={<Loader2 className="h-8 w-8 text-ink-500 animate-spin" />}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
