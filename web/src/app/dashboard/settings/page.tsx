"use client";
import { useAuthStore } from "@/lib/store";

export default function SettingsPage() {
  const { user, currentOrg } = useAuthStore();
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="font-display text-2xl text-ink-100 mb-1">Settings</h1>
      <p className="text-sm text-ink-500 mb-8">Manage your account and organization</p>
      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Account</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-ink-600 text-xs mb-1">Name</p><p className="text-ink-200">{user?.full_name}</p></div>
          <div><p className="text-ink-600 text-xs mb-1">Email</p><p className="text-ink-200">{user?.email}</p></div>
        </div>
      </div>
      <div className="glass rounded-2xl p-6 space-y-4 mt-4">
        <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Organization</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-ink-600 text-xs mb-1">Name</p><p className="text-ink-200">{currentOrg?.name}</p></div>
          <div><p className="text-ink-600 text-xs mb-1">Plan</p><p className="text-ink-200 capitalize">{currentOrg?.plan}</p></div>
          <div><p className="text-ink-600 text-xs mb-1">Role</p><p className="text-ink-200 capitalize">{currentOrg?.role}</p></div>
          <div><p className="text-ink-600 text-xs mb-1">Slug</p><p className="text-ink-200 font-mono text-xs">{currentOrg?.slug}</p></div>
        </div>
      </div>
    </div>
  );
}
