import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, OrganizationSummary } from "@/types";
import { authApi } from "@/lib/api";
import { AxiosError } from "axios";

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
        try {
          const res = await authApi.login(email, password);
          const token = res.headers["authorization"]?.replace("Bearer ", "");
          if (token) { localStorage.setItem("fp_token", token); set({ token }); }
          await get().fetchMe();
        } catch (err) {
          const axiosErr = err as AxiosError;
          const status = axiosErr.response?.status;
          if (status === 401 || status === 422) {
            console.error("[auth] Login failed: invalid credentials", { email });
          } else {
            console.error("[auth] Login failed: unexpected error", { status, message: axiosErr.message });
          }
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        await authApi.logout().catch(() => {});
        localStorage.removeItem("fp_token");
        set({ user: null, token: null, currentOrg: null });
      },

      fetchMe: async () => {
        try {
          const res = await authApi.me();
          const user: User = res.data.data;
          const persisted = get().currentOrg;
          const freshOrg = user.organizations.find(o => o.slug === persisted?.slug) ?? user.organizations[0] ?? null;
          set({ user, currentOrg: freshOrg });
        } catch (err) {
          const axiosErr = err as AxiosError;
          console.error("[auth] fetchMe failed", { status: axiosErr.response?.status, message: axiosErr.message });
          throw err;
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
