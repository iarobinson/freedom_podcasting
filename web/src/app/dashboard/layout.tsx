"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MailWarning, Menu, X } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { authApi } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { Toaster } from "@/components/ui/Toaster";
import { toast } from "@/lib/toast";

const queryClient = new QueryClient();

function UnverifiedBanner() {
  const { user } = useAuthStore();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);

  if (!user || user.confirmed_at || dismissed) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      await authApi.resendConfirmation();
      toast.success("Verification email sent", "Check your inbox.");
      setDismissed(true);
    } catch {
      toast.error("Could not send email", "Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2 flex items-center gap-3 text-sm text-yellow-300">
      <MailWarning className="h-4 w-4 shrink-0" />
      <span className="flex-1">
        Please verify your email address.{" "}
        <button
          onClick={handleResend}
          disabled={sending}
          className="underline hover:no-underline disabled:opacity-50"
        >
          {sending ? "Sending…" : "Resend verification email"}
        </button>
      </span>
      <button onClick={() => setDismissed(true)} className="text-yellow-500/60 hover:text-yellow-300">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { fetchMe, currentOrg } = useAuthStore();
  const [ready, setReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("fp_token");
    if (!token) { router.push("/auth/login"); return; }
    fetchMe()
      .then(() => setReady(true))
      .catch(() => { router.push("/auth/login"); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen bg-ink-950" style={{ colorScheme: "dark" }}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col overflow-auto min-w-0">
          {/* Mobile top bar — hidden on desktop */}
          <div className="md:hidden flex items-center h-12 px-4 border-b border-ink-800 bg-ink-950 shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 text-ink-400 hover:text-ink-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex-1 text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-ink-500">
                {currentOrg?.name ?? "Freedom Podcasting"}
              </span>
            </div>
            {/* Spacer to balance the hamburger */}
            <div className="w-7" />
          </div>

          <UnverifiedBanner />
          <main className="flex-1">
            {children}
          </main>
        </div>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}
