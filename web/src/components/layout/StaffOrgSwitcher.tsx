"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Search, Building2 } from "lucide-react";
import { staffApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import type { OrganizationSummary, StaffOrgSummary } from "@/types";
import { clsx } from "clsx";

export function StaffOrgSwitcher() {
  const { user, currentOrg, setCurrentOrgFromStaff } = useAuthStore();
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const containerRef        = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["staff-orgs", search],
    queryFn:  () => staffApi.listOrgs({ q: search || undefined, per_page: 25 } as { q?: string; per_page?: number }),
    enabled:  open,
    staleTime: 30_000,
  });

  const orgs: StaffOrgSummary[] = data?.data?.data ?? [];

  const handleSelect = (org: StaffOrgSummary) => {
    const summary: OrganizationSummary = {
      id:   org.id,
      name: org.name,
      slug: org.slug,
      plan: org.plan,
      role: (user?.staff_role ?? "editor") as OrganizationSummary["role"],
    };
    setCurrentOrgFromStaff(summary);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className="relative px-3 pb-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-1.5 px-2 py-1.5 text-[9px] font-bold uppercase tracking-widest text-purple-400 hover:text-purple-300 hover:bg-ink-800 transition-colors border-l-2 border-purple-500/40 pl-[6px]"
      >
        <Building2 className="h-3 w-3 shrink-0" />
        <span className="flex-1 text-left truncate">Switch client org</span>
        <ChevronDown className={clsx("h-3 w-3 shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-3 right-3 top-full mt-1 bg-ink-900 border border-ink-700 rounded shadow-xl z-50">
          <div className="p-2 border-b border-ink-800">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-ink-800 rounded">
              <Search className="h-3 w-3 text-ink-500 shrink-0" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orgs…"
                className="bg-transparent text-xs text-ink-200 placeholder-ink-600 outline-none w-full"
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto">
            {isLoading && (
              <p className="px-3 py-2 text-[11px] text-ink-600">Loading…</p>
            )}
            {!isLoading && orgs.length === 0 && (
              <p className="px-3 py-2 text-[11px] text-ink-600">No orgs found.</p>
            )}
            {orgs.map((org) => (
              <button
                key={org.id}
                type="button"
                onClick={() => handleSelect(org)}
                className={clsx(
                  "w-full text-left px-3 py-2 text-xs transition-colors hover:bg-ink-800",
                  currentOrg?.slug === org.slug ? "text-accent" : "text-ink-300"
                )}
              >
                <span className="font-semibold">{org.name}</span>
                <span className="ml-2 text-[9px] uppercase tracking-widest text-ink-600">{org.plan}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
