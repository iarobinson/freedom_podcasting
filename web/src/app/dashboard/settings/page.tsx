"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { useRole } from "@/lib/useRole";
import { authApi, organizationsApi } from "@/lib/api";
import { PLAN_CATALOGUE } from "@/lib/plans";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "@/lib/toast";
import { extractErrorMessage } from "@/lib/errorUtils";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-ink-600 mb-1">{label}</p>
      <div className="text-sm text-ink-200">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, currentOrg, fetchMe } = useAuthStore();
  const { canManage } = useRole();

  const [editingAccount, setEditingAccount] = useState(false);
  const [editingOrg, setEditingOrg] = useState(false);
  const [saving, setSaving] = useState(false);
  const [account, setAccount] = useState({ first_name: "", last_name: "" });
  const [orgName, setOrgName] = useState("");

  useEffect(() => {
    if (user) setAccount({ first_name: user.first_name, last_name: user.last_name });
  }, [user]);
  useEffect(() => {
    if (currentOrg) setOrgName(currentOrg.name);
  }, [currentOrg]);

  const saveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.updateMe(account);
      await fetchMe();
      toast.success("Account updated.");
      setEditingAccount(false);
    } catch (err) {
      toast.error("Could not update account", extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const saveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg) return;
    setSaving(true);
    try {
      await organizationsApi.update(currentOrg.slug, { name: orgName.trim() });
      await fetchMe();
      toast.success("Organization updated.");
      setEditingOrg(false);
    } catch (err) {
      toast.error("Could not update organization", extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="font-display text-2xl text-ink-100 mb-1">Settings</h1>
      <p className="text-sm text-ink-500 mb-8">Manage your account and organization</p>

      {/* Account */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Account</h2>
          {!editingAccount && <Button size="sm" variant="secondary" onClick={() => setEditingAccount(true)}>Edit account</Button>}
        </div>
        {editingAccount ? (
          <form onSubmit={saveAccount} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="First name" value={account.first_name} onChange={(e) => setAccount((a) => ({ ...a, first_name: e.target.value }))} required />
              <Input label="Last name"  value={account.last_name}  onChange={(e) => setAccount((a) => ({ ...a, last_name: e.target.value }))} required />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" size="sm" variant="ghost" onClick={() => setEditingAccount(false)}>Cancel</Button>
              <Button type="submit" size="sm" loading={saving}>Save</Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Name">{user?.full_name}</Field>
            <Field label="Email">{user?.email}</Field>
            <Field label="Password">
              <Link href="/auth/forgot-password" className="text-ink-400 hover:text-ink-100 underline text-xs">Send a password reset link</Link>
            </Field>
          </div>
        )}
      </div>

      {/* Organization */}
      <div className="glass rounded-2xl p-6 mt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Organization</h2>
          {canManage && !editingOrg && <Button size="sm" variant="secondary" onClick={() => setEditingOrg(true)}>Edit organization</Button>}
        </div>
        {editingOrg ? (
          <form onSubmit={saveOrg} className="space-y-4">
            <Input label="Organization name" value={orgName} onChange={(e) => setOrgName(e.target.value)} required minLength={2} />
            <div className="flex justify-end gap-2">
              <Button type="button" size="sm" variant="ghost" onClick={() => setEditingOrg(false)}>Cancel</Button>
              <Button type="submit" size="sm" loading={saving}>Save</Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Name">{currentOrg?.name}</Field>
            <Field label="Your role"><span className="capitalize">{currentOrg?.role}</span></Field>
            <Field label="Plan">
              {currentOrg ? PLAN_CATALOGUE[currentOrg.plan].label : "—"}
              {currentOrg?.role === "owner" && (
                <Link href="/dashboard/settings/billing" className="ml-2 text-xs text-ink-500 hover:text-ink-200 underline">Manage</Link>
              )}
            </Field>
            <Field label="Workspace URL">
              <span className="font-mono text-xs">{currentOrg?.slug}</span>
              <p className="text-[10px] text-ink-600 mt-0.5">Used in your public podcast page links, so it can&apos;t be changed here.</p>
            </Field>
          </div>
        )}
      </div>
    </div>
  );
}
