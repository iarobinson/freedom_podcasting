"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Trash2, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { useRole } from "@/lib/useRole";
import { membersApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "@/components/ui/Toaster";
import type { Member, Role } from "@/types";

const ROLE_OPTIONS: { value: Exclude<Role, "owner">; label: string }[] = [
  { value: "admin",  label: "Admin"  },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
];

const ROLE_COLORS: Record<Role, string> = {
  owner:  "text-amber-400 bg-amber-400/10 border-amber-400/20",
  admin:  "text-sky-400 bg-sky-400/10 border-sky-400/20",
  editor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  viewer: "text-ink-400 bg-ink-400/10 border-ink-400/20",
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
      qc.invalidateQueries({ queryKey: ["members", currentOrg.slug] });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg ?? "Could not send invitation.");
    } finally {
      setInviting(false);
    }
  };

  const members = data ?? [];

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="font-display text-2xl text-ink-100 mb-1">Team Members</h1>
      <p className="text-sm text-ink-500 mb-8">Manage who has access to {currentOrg?.name}</p>

      {/* Invite form — owner/admin only */}
      {canManage && (
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-4">Invite Someone</h2>
          <form onSubmit={handleInvite} className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                label="Email Address"
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
                required
              />
            </div>
            <div className="w-36">
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

      {/* Members list */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-ink-800">
          <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">
            Members ({members.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="px-6 py-8 text-center text-ink-600 text-sm">Loading...</div>
        ) : members.length === 0 ? (
          <div className="px-6 py-8 text-center text-ink-600 text-sm">No members yet.</div>
        ) : (
          <ul className="divide-y divide-ink-800">
            {members.map(m => {
              const isMe = m.user_id === user?.id;
              const isPending = !m.accepted_at;
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

                  {/* Status */}
                  {isPending && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5">
                      Pending
                    </span>
                  )}

                  {/* Role badge / changer */}
                  {canManage && m.role !== "owner" && !isMe ? (
                    <div className="relative">
                      <select
                        value={m.role}
                        onChange={e => roleChangeMutation.mutate({ userId: m.user_id, role: e.target.value })}
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
      </div>

      {/* Role legend */}
      <div className="glass rounded-2xl p-6 mt-6">
        <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-4">Role Permissions</h2>
        <div className="space-y-2 text-xs text-ink-500">
          <div className="flex gap-3"><span className="text-amber-400 font-bold w-12">Owner</span><span>Full control. Can manage billing, delete the organization.</span></div>
          <div className="flex gap-3"><span className="text-sky-400 font-bold w-12">Admin</span><span>Can manage podcasts, episodes, and invite/remove members.</span></div>
          <div className="flex gap-3"><span className="text-emerald-400 font-bold w-12">Editor</span><span>Can create and edit podcasts and episodes. Cannot manage members.</span></div>
          <div className="flex gap-3"><span className="text-ink-400 font-bold w-12">Viewer</span><span>Read-only access to podcasts and episodes.</span></div>
        </div>
      </div>
    </div>
  );
}
