"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { Sidebar } from "@/components/layout/Sidebar";
import { Toaster } from "@/components/ui/Toaster";

const queryClient = new QueryClient();

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { fetchMe } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Read token from localStorage directly to avoid Zustand hydration race
    const token = localStorage.getItem("fp_token");
    if (!token) { router.push("/auth/login"); return; }
    fetchMe()
      .then(() => setReady(true))
      .catch(() => { router.push("/auth/login"); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen bg-ink-950">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}
