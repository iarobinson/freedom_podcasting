import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, OrganizationSummary } from "@/types";
import { authApi } from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  currentOrg: OrganizationSummary | null;
  isLoading: boolean;
  login:       (email: string, password: string) => Promise<void>;
  logout:      () => Promise<void>;
  fetchMe:     () => Promise<void>;
  setCurrentOrg: (org: OrganizationSummary) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null, token: null, currentOrg: null, isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        const res = await authApi.login(email, password);
        const token = res.headers["authorization"]?.replace("Bearer ", "");
        if (token) { localStorage.setItem("fp_token", token); set({ token }); }
        await get().fetchMe();
        set({ isLoading: false });
      },

      logout: async () => {
        await authApi.logout().catch(() => {});
        localStorage.removeItem("fp_token");
        set({ user: null, token: null, currentOrg: null });
      },

      fetchMe: async () => {
        const res = await authApi.me();
        const user: User = res.data.data;
        set({ user });
        if (!get().currentOrg && user.organizations.length > 0) {
          set({ currentOrg: user.organizations[0] });
        }
      },

      setCurrentOrg: (org) => set({ currentOrg: org }),
    }),
    {
      name: "fp-auth",
      partialize: (s) => ({ token: s.token, currentOrg: s.currentOrg }),
    }
  )
);
