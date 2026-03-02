import { useAuthStore } from "@/lib/store";

export function useRole() {
  const { currentOrg } = useAuthStore();
  const role = currentOrg?.role ?? "viewer";
  return {
    role,
    canEdit:   ["owner", "admin", "editor"].includes(role),
    canManage: ["owner", "admin"].includes(role),
    isOwner:   role === "owner",
  };
}
