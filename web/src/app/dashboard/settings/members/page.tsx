"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Trash2, ChevronDown, Mail, RotateCw, X, Users } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { useRole } from "@/lib/useRole";
import { membersApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "@/lib/toast";
import type { Member, Role, PendingInvitation } from "@/types";

const ROLE_OPTIONS: { value: Exclude<Role, "owner">; label: string }[] = [
  { value: "admin",  label: "Admin"  },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
];

// Gold is reserved for the owner; other roles stay neutral.
const ROLE_COLORS: Record<Role, string> = {
  owner:  "text-amber-400 bg-amber-400/10 border-amber-400/20",
  admin:  "text-ink-200 bg-ink-800 border-ink-600",
  editor: "text-ink-300 bg-ink-800 border-ink-700",
  viewer: "text-ink-500 bg-ink-900 border-ink-800",
};

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  owner:  "Full workspace control, including billing and organization settings.",
  admin:  "Can manage podcasts, episodes, and team members.",
  editor: "Can create and edit podcast content, but cannot manage team or billing.",
  viewer: "Read-only access to podcast content.",
};

export default function MembersPage() {
  const { currentOrg, user } = useAuthStore();
  const { canManage } = useRole();
  const qc = useQueryClient();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole]   = useState<Exclude<Role, "owner">>("editor");
  const [inviting, setInviting]       = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["members", currentOrg?.slug],
    queryFn:  () => membersApi.list(currentOrg!.slug).then(r => r.data.data as Member[]),
    enabled:  !!currentOrg,
  });

  const { data: pending = [] } = useQuery({
    queryKey: ["invitations", currentOrg?.slug],
    queryFn:  () => membersApi.pending(currentOrg!.slug).then(r => r.data.data),
    enabled:  !!currentOrg && canManage,
  });

  const refreshTeam = () => {
    qc.invalidateQueries({ queryKey: ["members", currentOrg?.slug] });
    qc.invalidateQueries({ queryKey: ["invitations", currentOrg?.slug] });
  };

  const resendMutation = useMutation({
    mutationFn: (email: string) => membersApi.resend(currentOrg!.slug, email),
    onSuccess: (_, email) => { refreshTeam(); toast.success(`Invitation resent to ${email}.`); },
    onError: () => toast.error("Could not resend invitation."),
  });

  const revokeMutation = useMutation({
    mutationFn: (email: string) => membersApi.revoke(currentOrg!.slug, email),
    onSuccess: (_, email) => { refreshTeam(); toast.success(`Invitation for ${email} revoked.`); },
    onError: () => toast.error("Could not revoke invitation."),
  });

  const removeMutation = useMutation({
    mutationFn: (userId: number) => membersApi.remove(currentOrg!.slug, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members", currentOrg?.slug] });
      toast.success("Member removed.");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg ?? "Could not remove member.");
    },
  });

  const roleChangeMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) =>
      membersApi.updateRole(currentOrg!.slug, userId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members", currentOrg?.slug] });
      toast.success("Role updated.");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg ?? "Could not update role.");
    },
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg || !inviteEmail.trim()) return;
    setInviting(true);
    try {
      await membersApi.invite(currentOrg.slug, inviteEmail.trim(), inviteRole);
      toast.success(`Invitation sent to ${inviteEmail.trim()}.`);
      setInviteEmail("");
      refreshTeam();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg ?? "Could not send invitation.");
    } finally {
      setInviting(false);
    }
  };

  // Unaccepted memberships are shown under "Pending invites" instead.
  const members = (data ?? []).filter(m => m.accepted_at || m.role === "owner");

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="font-display text-2xl text-ink-100 mb-1">Team members</h1>
      <p className="text-sm text-ink-500 mb-8">Manage who has access to {currentOrg?.name}</p>

      {/* Invite form — owner/admin only */}
      {canManage && (
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1">Invite someone</h2>
          <p className="text-xs text-ink-600 mb-4">Give editors, producers, or clients the right level of access. Invitations expire after 7 days.</p>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1">
              <Input
                label="Email address"
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
                required
              />
            </div>
            <div className="sm:w-36">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-500 mb-1.5">Role</label>
              <div className="relative">
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as Exclude<Role, "owner">)}
                  className="w-full bg-ink-900 border border-ink-700 text-ink-200 text-xs px-3 py-2 appearance-none focus:outline-none focus:border-accent"
                >
                  {ROLE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-ink-500 pointer-events-none" />
              </div>
            </div>
            <Button type="submit" loading={inviting} size="sm">
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              Invite
            </Button>
          </form>
        </div>
      )}

      {/* Pending invites */}
      {canManage && pending.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-ink-800">
            <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Pending invites ({pending.length})</h2>
          </div>
          <ul className="divide-y divide-ink-800">
            {pending.map((inv: PendingInvitation) => (
              <li key={inv.email} className="flex flex-wrap items-center gap-3 px-6 py-3">
                <Mail className="h-4 w-4 text-ink-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink-200 truncate">{inv.email}</p>
                  <p className="text-[11px] text-ink-600">
                    Invited {new Date(inv.invited_at).toLocaleDateString()}
                    {inv.expired && <span className="text-amber-500"> · Expired</span>}
                  </p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 ${ROLE_COLORS[inv.role]}`}>{inv.role}</span>
                <button onClick={() => resendMutation.mutate(inv.email)} disabled={resendMutation.isPending}
                  className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-ink-400 hover:text-ink-100 px-2 py-1">
                  <RotateCw className="h-3 w-3" /> Resend
                </button>
                <button onClick={() => { if (confirm(`Revoke the invitation for ${inv.email}?`)) revokeMutation.mutate(inv.email); }}
                  className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-ink-500 hover:text-accent px-2 py-1">
                  <X className="h-3 w-3" /> Revoke
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Members list */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-ink-800">
          <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">
            Members ({members.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="px-6 py-8 text-center text-ink-600 text-sm">Loading...</div>
        ) : (
          <ul className="divide-y divide-ink-800">
            {members.map(m => {
              const isMe = m.user_id === user?.id;
              return (
                <li key={m.user_id} className="flex items-center gap-4 px-6 py-4">
                  {/* Avatar placeholder */}
                  <div className="h-8 w-8 rounded-full bg-ink-800 border border-ink-700 flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-bold text-ink-400 uppercase">
                      {m.full_name.charAt(0)}
                    </span>
                  </div>

                  {/* Name + email */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-200 truncate">
                      {m.full_name}
                      {isMe && <span className="ml-1.5 text-[10px] text-ink-600 font-normal">(you)</span>}
                    </p>
                    <p className="text-xs text-ink-500 truncate">{m.email}</p>
                  </div>

                  {/* Role badge / changer */}
                  {canManage && m.role !== "owner" && !isMe ? (
                    <div className="relative">
                      <select
                        value={m.role}
                        onChange={e => {
                          const role = e.target.value;
                          if (confirm(`Change ${m.full_name}'s role from ${m.role} to ${role}?\n\n${ROLE_DESCRIPTIONS[role as Role]}`)) {
                            roleChangeMutation.mutate({ userId: m.user_id, role });
                          }
                        }}
                        className="bg-transparent border border-ink-700 text-ink-400 text-[10px] font-bold uppercase tracking-wider px-2 py-1 pr-5 appearance-none focus:outline-none focus:border-accent cursor-pointer"
                      >
                        {ROLE_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-ink-500 pointer-events-none" />
                    </div>
                  ) : (
                    <span className={`text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 ${ROLE_COLORS[m.role]}`}>
                      {m.role}
                    </span>
                  )}

                  {/* Remove button */}
                  {canManage && m.role !== "owner" && !isMe && (
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${m.full_name} from ${currentOrg?.name}?`)) {
                          removeMutation.mutate(m.user_id);
                        }
                      }}
                      className="text-ink-600 hover:text-red-500 transition-colors p-1"
                      title="Remove member"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {!isLoading && members.length <= 1 && pending.length === 0 && canManage && (
          <div className="border-t border-ink-800">
            <EmptyState compact icon={Users} title="Invite your team"
              body="Give editors, producers, or clients the right level of access." />
          </div>
        )}
      </div>

      {/* Role legend */}
      <div className="glass rounded-2xl p-6 mt-6">
        <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-4">Role permissions</h2>
        <div className="space-y-2 text-xs text-ink-500">
          {(Object.keys(ROLE_DESCRIPTIONS) as Role[]).map(r => (
            <div key={r} className="flex gap-3">
              <span className={`font-bold w-14 capitalize ${r === "owner" ? "text-amber-400" : "text-ink-300"}`}>{r}</span>
              <span>{ROLE_DESCRIPTIONS[r]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
