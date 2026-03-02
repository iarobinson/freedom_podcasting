"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Radio, CheckCircle } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { membersApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";

function AcceptInvitationContent() {
  const router       = useRouter();
  const params       = useSearchParams();
  const token        = params.get("token") ?? "";
  const { token: authToken, fetchMe } = useAuthStore();

  const [accepting, setAccepting] = useState(false);
  const [error, setError]         = useState("");
  const [done, setDone]           = useState(false);
  const [orgSlug, setOrgSlug]     = useState("");

  useEffect(() => {
    if (!token) { router.replace("/dashboard"); }
  }, [token, router]);

  const handleAccept = async () => {
    setError(""); setAccepting(true);
    try {
      const res = await membersApi.accept(token);
      const slug: string = res.data.data?.org_slug ?? "";
      setOrgSlug(slug);
      setDone(true);
      await fetchMe(); // refresh org list in store
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data;
      setError(msg?.error ?? msg?.message ?? "Could not accept invitation. It may have expired.");
    } finally {
      setAccepting(false);
    }
  };

  if (done) {
    return (
      <div className="w-full max-w-sm relative text-center">
        <div className="inline-flex items-center justify-center h-12 w-12 border border-emerald-500 mb-6">
          <CheckCircle className="h-5 w-5 text-emerald-500" />
        </div>
        <h1 className="text-xl font-bold uppercase tracking-widest text-ink-100 mb-2">You&apos;re In</h1>
        <p className="text-sm text-ink-500 mb-8">Invitation accepted. Welcome to the team.</p>
        <Button
          onClick={() => router.push("/dashboard")}
          className="w-full"
          size="lg"
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }

  if (!authToken) {
    const loginUrl  = `/auth/login?redirect=${encodeURIComponent(`/auth/accept-invitation?token=${token}`)}`;
    const registerUrl = `/auth/register?redirect=${encodeURIComponent(`/auth/accept-invitation?token=${token}`)}`;
    return (
      <div className="w-full max-w-sm relative">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-12 w-12 border border-accent mb-4">
            <Radio className="h-5 w-5 text-accent" />
          </div>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-accent">Freedom Podcasting</p>
          <h1 className="text-xl font-bold uppercase tracking-widest text-ink-100 mt-1">Accept Invitation</h1>
          <hr className="accent-rule mt-3 mx-auto w-16" />
        </div>
        <div className="panel p-6 space-y-4 text-center">
          <p className="text-sm text-ink-400">You need to be signed in to accept this invitation.</p>
          <div className="space-y-2">
            <Link href={loginUrl}>
              <Button className="w-full" size="lg">Sign In</Button>
            </Link>
            <Link href={registerUrl}>
              <Button variant="ghost" className="w-full" size="lg">Create Account</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm relative">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center h-12 w-12 border border-accent mb-4">
          <Radio className="h-5 w-5 text-accent" />
        </div>
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-accent">Freedom Podcasting</p>
        <h1 className="text-xl font-bold uppercase tracking-widest text-ink-100 mt-1">You&apos;re Invited</h1>
        <hr className="accent-rule mt-3 mx-auto w-16" />
      </div>

      <div className="panel p-6 space-y-4">
        <p className="text-sm text-ink-400 text-center">
          Click below to accept your invitation and join the workspace.
        </p>
        {error && <p className="text-[11px] text-accent uppercase tracking-wide text-center">{error}</p>}
        <Button onClick={handleAccept} loading={accepting} className="w-full" size="lg">
          Accept Invitation
        </Button>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
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
        <AcceptInvitationContent />
      </Suspense>
    </div>
  );
}
