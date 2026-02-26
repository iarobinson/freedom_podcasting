"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { Sidebar } from "@/components/layout/Sidebar";
import { Toaster } from "@/components/ui/Toaster";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, fetchMe } = useAuthStore();

  useEffect(() => {
    if (!token) { router.push("/auth/login"); return; }
    fetchMe().catch(() => { router.push("/auth/login"); });
  }, [token, router, fetchMe]);

  if (!token) return null;

  return (
    <div className="flex min-h-screen bg-ink-950">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
