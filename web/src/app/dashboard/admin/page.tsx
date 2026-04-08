"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Shield, Plus, Building2, RefreshCw } from "lucide-react";
import { staffApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useRole } from "@/lib/useRole";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { StaffOrgSummary, OrganizationSummary } from "@/types";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50);
}

export default function AdminPage() {
  const router       = useRouter();
  const { user, setCurrentOrgFromStaff } = useAuthStore();
  const { isStaff }  = useRole();
  const qc           = useQueryClient();

  // Redirect non-staff immediately
  useEffect(() => {
    if (user && !user.is_staff) router.push("/dashboard");
  }, [user, router]);

  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]     = useState({ name: "", slug: "", plan: "free", rss_url: "" });
  const [submitting, setSubmitting] = useState(false);

  // Auto-derive slug from name
  const handleNameChange = (name: string) => {
    setForm(f => ({ ...f, name, slug: slugify(name) }));
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["staff-orgs-admin", search, page],
    queryFn:  () => staffApi.listOrgs({ q: search || undefined, page }),
    enabled:  isStaff,
  });

  const orgs: StaffOrgSummary[] = data?.data?.data ?? [];
  const meta  = data?.data?.meta;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      await staffApi.createOrg({
        organization: { name: form.name.trim(), slug: form.slug.trim() || undefined },
        plan: form.plan,
        rss_url: form.rss_url.trim() || undefined,
      });
      toast.success("Organization created", form.rss_url ? "RSS import started." : undefined);
      setForm({ name: "", slug: "", plan: "free", rss_url: "" });
      setShowForm(false);
      qc.invalidateQueries({ queryKey: ["staff-orgs"] });
      qc.invalidateQueries({ queryKey: ["staff-orgs-admin"] });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { errors?: string[] } } };
      const msg = e.response?.data?.errors?.join(", ") ?? "Failed to create organization.";
      toast.error("Error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const switchTo = (org: StaffOrgSummary) => {
    const summary: OrganizationSummary = {
      id:   org.id,
      name: org.name,
      slug: org.slug,
      plan: org.plan,
      role: (user?.staff_role ?? "editor") as OrganizationSummary["role"],
    };
    setCurrentOrgFromStaff(summary);
    router.push("/dashboard");
  };

  if (!isStaff) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-purple-400" />
          <div>
            <h1 className="text-xl font-bold uppercase tracking-widest text-ink-100">Agency Admin</h1>
            <p className="text-[11px] text-ink-500 uppercase tracking-widest mt-0.5">Staff access — all client organizations</p>
          </div>
        </div>
        <Button
          onClick={() => setShowForm(s => !s)}
          size="sm"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          New Client Org
        </Button>
      </div>

      {/* Create org form */}
      {showForm && (
        <form onSubmit={handleCreate} className="panel p-6 space-y-4">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-300">New Client Organization</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Organization Name"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
            <Input
              label="Slug"
              value={form.slug}
              onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
              placeholder="auto-derived"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-ink-500">Plan</label>
              <select
                value={form.plan}
                onChange={(e) => setForm(f => ({ ...f, plan: e.target.value }))}
                className="w-full bg-ink-900 border border-ink-700 rounded px-3 py-2 text-sm text-ink-200 focus:border-accent outline-none"
              >
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="agency">Agency</option>
              </select>
            </div>
            <Input
              label="RSS Feed URL (optional import)"
              type="url"
              value={form.rss_url}
              onChange={(e) => setForm(f => ({ ...f, rss_url: e.target.value }))}
              placeholder="https://..."
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" size="sm" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={submitting}>
              Create Organization
            </Button>
          </div>
        </form>
      )}

      {/* Search + list */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Input
            label=""
            placeholder="Search organizations…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => refetch()}
            className="text-ink-500 hover:text-ink-300 transition-colors mt-0.5"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {isLoading && (
          <div className="panel p-6 shimmer-bg h-32" />
        )}

        {!isLoading && orgs.length === 0 && (
          <div className="panel p-8 text-center">
            <Building2 className="h-8 w-8 text-ink-700 mx-auto mb-3" />
            <p className="text-[11px] text-ink-500 uppercase tracking-widest">No organizations found.</p>
          </div>
        )}

        {!isLoading && orgs.length > 0 && (
          <div className="panel divide-y divide-ink-800">
            {orgs.map((org) => (
              <div key={org.id} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink-100 truncate">{org.name}</p>
                  <p className="text-[10px] text-ink-600 uppercase tracking-widest">
                    {org.slug} &middot; {org.podcast_count} podcast{org.podcast_count !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-ink-500 border border-ink-700 px-2 py-0.5 rounded">
                    {org.plan}
                  </span>
                  <button
                    type="button"
                    onClick={() => switchTo(org)}
                    className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-accent/80 transition-colors"
                  >
                    Switch →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.total > meta.per_page && (
          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-[11px] text-ink-500 hover:text-ink-300 disabled:opacity-30 uppercase tracking-widest"
            >
              ← Prev
            </button>
            <span className="text-[11px] text-ink-600 uppercase tracking-widest">
              {page} / {Math.ceil(meta.total / meta.per_page)}
            </span>
            <button
              type="button"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(meta.total / meta.per_page)}
              className="text-[11px] text-ink-500 hover:text-ink-300 disabled:opacity-30 uppercase tracking-widest"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
