#!/bin/bash
# Session 2: Auth pages, Dashboard, Podcast/Episode management, Public podcast page
# Run from the root of your freedom_podcasting repo

set -e
echo "🎙️  FreedomPodcasting — Session 2: Frontend UI"
echo "================================================"

# ── Helpers ───────────────────────────────────────────────────────────────────
write_file() {
  local path="$1"
  mkdir -p "$(dirname "$path")"
  cat > "$path"
  echo "  ✓ $path"
}

# ══════════════════════════════════════════════════════════════════════════════
# NEXT.JS CONFIG & SUPPORTING FILES
# ══════════════════════════════════════════════════════════════════════════════

write_file "web/next.config.js" << 'NEXTCONFIG'
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["media.freedompodcasting.com", "localhost"],
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
      ],
    }];
  },
};
module.exports = nextConfig;
NEXTCONFIG

write_file "web/postcss.config.js" << 'POSTCSS'
module.exports = {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
POSTCSS

write_file "web/tailwind.config.ts" << 'TAILWIND'
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#fdf2f8", 100: "#fce7f3", 200: "#fbcfe8",
          300: "#f9a8d4", 400: "#f472b6", 500: "#ec4899",
          600: "#db2777", 700: "#be185d", 800: "#9d174d", 900: "#831843",
        },
        ink: {
          50:  "#f8f7f4", 100: "#f0ede6", 200: "#e1dbd0",
          300: "#c8bfae", 400: "#a89880", 500: "#8a7660",
          600: "#6e5c48", 700: "#564738", 800: "#3d3228", 900: "#241d18",
          950: "#120e0b",
        },
      },
      fontFamily: {
        sans:    ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
        mono:    ["var(--font-dm-mono)", "monospace"],
      },
      borderRadius: {
        lg: "0.75rem", md: "0.5rem", sm: "0.375rem",
      },
      keyframes: {
        "fade-up":   { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "fade-in":   { from: { opacity: "0" }, to: { opacity: "1" } },
        "shimmer":   { from: { backgroundPosition: "-200% 0" }, to: { backgroundPosition: "200% 0" } },
        "pulse-dot": { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.4" } },
      },
      animation: {
        "fade-up":   "fade-up 0.4s ease-out forwards",
        "fade-in":   "fade-in 0.3s ease-out forwards",
        "shimmer":   "shimmer 2s linear infinite",
        "pulse-dot": "pulse-dot 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
TAILWIND

write_file "web/tsconfig.json" << 'TSCONFIG'
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
TSCONFIG

# ══════════════════════════════════════════════════════════════════════════════
# GLOBAL CSS
# ══════════════════════════════════════════════════════════════════════════════

write_file "web/src/app/globals.css" << 'CSS'
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Playfair+Display:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

:root {
  --font-dm-sans: 'DM Sans', system-ui, sans-serif;
  --font-playfair: 'Playfair Display', Georgia, serif;
  --font-dm-mono: 'DM Mono', monospace;
}

@layer base {
  * { @apply border-ink-200; box-sizing: border-box; }

  body {
    @apply bg-ink-950 text-ink-100 font-sans antialiased;
    background-image:
      radial-gradient(ellipse 80% 50% at 20% 0%, rgba(236,72,153,0.07) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 100%, rgba(236,72,153,0.05) 0%, transparent 60%);
    min-height: 100vh;
  }

  h1,h2,h3 { @apply font-display; }
}

@layer utilities {
  .glass {
    background: rgba(255,255,255,0.04);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.08);
  }
  .glass-hover {
    @apply transition-all duration-200;
  }
  .glass-hover:hover {
    background: rgba(255,255,255,0.07);
    border-color: rgba(255,255,255,0.12);
  }
  .text-gradient {
    background: linear-gradient(135deg, #f9a8d4 0%, #ec4899 50%, #be185d 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.1) transparent;
  }
  .shimmer-bg {
    background: linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 100%);
    background-size: 200% 100%;
    @apply animate-shimmer;
  }
}
CSS

# ══════════════════════════════════════════════════════════════════════════════
# TYPES
# ══════════════════════════════════════════════════════════════════════════════

write_file "web/src/types/index.ts" << 'TYPES'
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  organizations: OrganizationSummary[];
}

export interface OrganizationSummary {
  id: number;
  name: string;
  slug: string;
  plan: Plan;
  role: Role;
}

export type Plan = "free" | "starter" | "pro" | "agency";
export type Role = "owner" | "admin" | "editor" | "viewer";

export interface Podcast {
  id: number;
  title: string;
  description: string;
  author: string;
  email: string;
  slug: string;
  artwork_url?: string;
  language: string;
  category?: string;
  subcategory?: string;
  explicit: boolean;
  podcast_type: "episodic" | "serial";
  website_url?: string;
  published: boolean;
  published_at?: string;
  rss_url: string;
  episode_count: number;
  published_episode_count: number;
  created_at: string;
  updated_at: string;
}

export type EpisodeStatus = "draft" | "scheduled" | "published";
export type EpisodeType   = "full" | "trailer" | "bonus";

export interface Episode {
  id: number;
  title: string;
  description: string;
  summary?: string;
  artwork_url?: string;
  audio_url?: string;
  audio_file_size?: number;
  audio_duration_seconds?: number;
  formatted_duration?: string;
  audio_content_type?: string;
  episode_type: EpisodeType;
  episode_number?: number;
  season_number?: number;
  explicit: boolean;
  keywords?: string;
  status: EpisodeStatus;
  published_at?: string;
  guid: string;
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface PresignedUploadResponse {
  media_file_id: number;
  presigned_url: string;
  r2_key: string;
  expires_in: number;
}
TYPES

# ══════════════════════════════════════════════════════════════════════════════
# LIB: API CLIENT
# ══════════════════════════════════════════════════════════════════════════════

write_file "web/src/lib/api.ts" << 'APICLIENT'
import axios, { AxiosError } from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("fp_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (r) => r,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("fp_token");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login:    (email: string, password: string) =>
    apiClient.post("/api/v1/auth/login", { user: { email, password } }),
  register: (data: { email: string; password: string; password_confirmation: string; first_name: string; last_name: string }) =>
    apiClient.post("/api/v1/auth/register", { user: data }),
  logout: () => apiClient.delete("/api/v1/auth/logout"),
  me:     () => apiClient.get("/api/v1/auth/me"),
};

export const podcastsApi = {
  list:      (orgSlug: string) => apiClient.get(`/api/v1/organizations/${orgSlug}/podcasts`),
  get:       (orgSlug: string, podcastSlug: string) => apiClient.get(`/api/v1/organizations/${orgSlug}/podcasts/${podcastSlug}`),
  create:    (orgSlug: string, data: Record<string, unknown>) => apiClient.post(`/api/v1/organizations/${orgSlug}/podcasts`, { podcast: data }),
  update:    (orgSlug: string, podcastSlug: string, data: Record<string, unknown>) => apiClient.patch(`/api/v1/organizations/${orgSlug}/podcasts/${podcastSlug}`, { podcast: data }),
  delete:    (orgSlug: string, podcastSlug: string) => apiClient.delete(`/api/v1/organizations/${orgSlug}/podcasts/${podcastSlug}`),
  publish:   (orgSlug: string, podcastSlug: string) => apiClient.post(`/api/v1/organizations/${orgSlug}/podcasts/${podcastSlug}/publish`),
  unpublish: (orgSlug: string, podcastSlug: string) => apiClient.post(`/api/v1/organizations/${orgSlug}/podcasts/${podcastSlug}/unpublish`),
};

export const episodesApi = {
  list:      (orgSlug: string, podcastSlug: string, page = 1) => apiClient.get(`/api/v1/organizations/${orgSlug}/podcasts/${podcastSlug}/episodes`, { params: { page, per_page: 20 } }),
  get:       (orgSlug: string, podcastSlug: string, id: number) => apiClient.get(`/api/v1/organizations/${orgSlug}/podcasts/${podcastSlug}/episodes/${id}`),
  create:    (orgSlug: string, podcastSlug: string, data: Record<string, unknown>) => apiClient.post(`/api/v1/organizations/${orgSlug}/podcasts/${podcastSlug}/episodes`, { episode: data }),
  update:    (orgSlug: string, podcastSlug: string, id: number, data: Record<string, unknown>) => apiClient.patch(`/api/v1/organizations/${orgSlug}/podcasts/${podcastSlug}/episodes/${id}`, { episode: data }),
  delete:    (orgSlug: string, podcastSlug: string, id: number) => apiClient.delete(`/api/v1/organizations/${orgSlug}/podcasts/${podcastSlug}/episodes/${id}`),
  publish:   (orgSlug: string, podcastSlug: string, id: number) => apiClient.post(`/api/v1/organizations/${orgSlug}/podcasts/${podcastSlug}/episodes/${id}/publish`),
  unpublish: (orgSlug: string, podcastSlug: string, id: number) => apiClient.post(`/api/v1/organizations/${orgSlug}/podcasts/${podcastSlug}/episodes/${id}/unpublish`),
};

export const uploadsApi = {
  presign:    (orgSlug: string, podcastSlug: string, data: { filename: string; content_type: string; upload_type: "audio" | "artwork" }) =>
    apiClient.post(`/api/v1/organizations/${orgSlug}/podcasts/${podcastSlug}/uploads/presign`, data),
  complete:   (orgSlug: string, podcastSlug: string, data: { media_file_id: number; episode_id?: number; file_size: number }) =>
    apiClient.post(`/api/v1/organizations/${orgSlug}/podcasts/${podcastSlug}/uploads/complete`, data),
  uploadToR2: async (presignedUrl: string, file: File, onProgress?: (pct: number) => void) => {
    await axios.put(presignedUrl, file, {
      headers: { "Content-Type": file.type },
      onUploadProgress: (e) => { if (e.total && onProgress) onProgress(Math.round((e.loaded * 100) / e.total)); },
    });
  },
};
APICLIENT

# ══════════════════════════════════════════════════════════════════════════════
# LIB: AUTH STORE
# ══════════════════════════════════════════════════════════════════════════════

write_file "web/src/lib/store.ts" << 'STORE'
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
STORE

# ══════════════════════════════════════════════════════════════════════════════
# LIB: TOAST
# ══════════════════════════════════════════════════════════════════════════════

write_file "web/src/lib/toast.ts" << 'TOAST'
import { create } from "zustand";

type ToastType = "success" | "error" | "info";
interface Toast { id: string; type: ToastType; title: string; description?: string; }

interface ToastStore {
  toasts: Toast[];
  add: (t: Omit<Toast, "id">) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add:    (t) => set((s) => ({ toasts: [...s.toasts, { ...t, id: crypto.randomUUID() }] })),
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (title: string, description?: string) => useToastStore.getState().add({ type: "success", title, description }),
  error:   (title: string, description?: string) => useToastStore.getState().add({ type: "error",   title, description }),
  info:    (title: string, description?: string) => useToastStore.getState().add({ type: "info",    title, description }),
};
TOAST

# ══════════════════════════════════════════════════════════════════════════════
# ROOT LAYOUT + PROVIDERS
# ══════════════════════════════════════════════════════════════════════════════

write_file "web/src/app/layout.tsx" << 'ROOTLAYOUT'
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";

export const metadata: Metadata = {
  title: { template: "%s | FreedomPodcasting", default: "FreedomPodcasting — Production Studio" },
  description: "Professional podcast hosting and AI-powered production tools.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://app.freedompodcasting.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
ROOTLAYOUT

write_file "web/src/app/page.tsx" << 'ROOTPAGE'
import { redirect } from "next/navigation";
export default function Home() { redirect("/dashboard"); }
ROOTPAGE

write_file "web/src/components/layout/Providers.tsx" << 'PROVIDERS'
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "@/components/ui/Toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
  }));
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}
PROVIDERS

# ══════════════════════════════════════════════════════════════════════════════
# UI COMPONENTS
# ══════════════════════════════════════════════════════════════════════════════

write_file "web/src/components/ui/Toaster.tsx" << 'TOASTER'
"use client";
import { useToastStore } from "@/lib/toast";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useEffect } from "react";

export function Toaster() {
  const { toasts, remove } = useToastStore();
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={() => remove(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast: t, onRemove }: { toast: { id: string; type: string; title: string; description?: string }; onRemove: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onRemove, 4000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const icons = {
    success: <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />,
    error:   <AlertCircle  className="h-4 w-4 text-red-400 shrink-0" />,
    info:    <Info         className="h-4 w-4 text-brand-400 shrink-0" />,
  } as Record<string, React.ReactNode>;

  return (
    <div className="glass rounded-xl p-4 flex items-start gap-3 animate-fade-up shadow-xl">
      <div className="mt-0.5">{icons[t.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink-100">{t.title}</p>
        {t.description && <p className="text-xs text-ink-400 mt-0.5">{t.description}</p>}
      </div>
      <button onClick={onRemove} className="text-ink-500 hover:text-ink-300 transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
TOASTER

write_file "web/src/components/ui/Button.tsx" << 'BUTTON'
import { clsx } from "clsx";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({ variant = "primary", size = "md", loading, className, children, disabled, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none";
  const variants = {
    primary:   "bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/20 active:scale-[0.98]",
    secondary: "glass glass-hover text-ink-200 hover:text-ink-100",
    ghost:     "text-ink-400 hover:text-ink-200 hover:bg-white/5",
    danger:    "bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20",
  };
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };

  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
BUTTON

write_file "web/src/components/ui/Input.tsx" << 'INPUT'
import { clsx } from "clsx";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-ink-300">{label}</label>}
      <input
        ref={ref}
        className={clsx(
          "w-full rounded-lg px-3.5 py-2.5 text-sm bg-white/5 border text-ink-100 placeholder:text-ink-600",
          "focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/60 transition-all",
          error ? "border-red-500/50 bg-red-500/5" : "border-white/10 hover:border-white/20",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-ink-500">{hint}</p>}
    </div>
  )
);
Input.displayName = "Input";
INPUT

write_file "web/src/components/ui/Textarea.tsx" << 'TEXTAREA'
import { clsx } from "clsx";
import { forwardRef } from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-ink-300">{label}</label>}
      <textarea
        ref={ref}
        className={clsx(
          "w-full rounded-lg px-3.5 py-2.5 text-sm bg-white/5 border text-ink-100 placeholder:text-ink-600",
          "focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/60 transition-all resize-none",
          error ? "border-red-500/50" : "border-white/10 hover:border-white/20",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-ink-500">{hint}</p>}
    </div>
  )
);
Textarea.displayName = "Textarea";
TEXTAREA

write_file "web/src/components/ui/Badge.tsx" << 'BADGE'
import { clsx } from "clsx";

interface BadgeProps { variant?: "default" | "success" | "warning" | "error" | "info"; children: React.ReactNode; className?: string; }

export function Badge({ variant = "default", children, className }: BadgeProps) {
  const variants = {
    default: "bg-white/8 text-ink-300 border-white/10",
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    error:   "bg-red-500/15 text-red-400 border-red-500/20",
    info:    "bg-brand-500/15 text-brand-300 border-brand-500/20",
  };
  return (
    <span className={clsx("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", variants[variant], className)}>
      {children}
    </span>
  );
}
BADGE

# ══════════════════════════════════════════════════════════════════════════════
# LAYOUT: SIDEBAR + DASHBOARD SHELL
# ══════════════════════════════════════════════════════════════════════════════

write_file "web/src/components/layout/Sidebar.tsx" << 'SIDEBAR'
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Mic2, LayoutDashboard, Radio, Upload, Sparkles, BarChart3, Users, Settings, LogOut, ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import { useAuthStore } from "@/lib/store";

const nav = [
  { label: "Dashboard",  href: "/dashboard",           icon: LayoutDashboard, exact: true },
  { label: "Podcasts",   href: "/dashboard/podcasts",  icon: Radio },
  { label: "Upload",     href: "/dashboard/upload",    icon: Upload },
  { label: "AI Tools",   href: "/dashboard/ai",        icon: Sparkles, soon: true },
  { label: "Analytics",  href: "/dashboard/analytics", icon: BarChart3, soon: true },
  { label: "Team",       href: "/dashboard/team",      icon: Users, soon: true },
  { label: "Settings",   href: "/dashboard/settings",  icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { currentOrg, user, logout } = useAuthStore();

  const isActive = (href: string, exact?: boolean) => exact ? pathname === href : pathname.startsWith(href);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return (
    <aside className="flex h-full w-60 flex-col border-r border-white/6 bg-ink-950/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-white/6 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 shadow-lg shadow-brand-500/30">
          <Mic2 className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-[13px] font-semibold tracking-tight text-ink-100 leading-none">FreedomPodcasting</p>
          <p className="text-[10px] text-ink-600 mt-0.5">Studio</p>
        </div>
      </div>

      {/* Org */}
      {currentOrg && (
        <div className="border-b border-white/6 p-2.5">
          <button className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-white/5 transition-colors">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-500/20 text-brand-400 text-[11px] font-bold shrink-0">
              {currentOrg.name[0].toUpperCase()}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-[12px] font-medium text-ink-200 truncate">{currentOrg.name}</p>
              <p className="text-[10px] text-ink-600 capitalize">{currentOrg.plan}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-ink-600 shrink-0" />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2.5 scrollbar-thin">
        <ul className="space-y-0.5">
          {nav.map((item) => (
            <li key={item.href}>
              <Link href={item.soon ? "#" : item.href}
                className={clsx(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                  isActive(item.href, item.exact)
                    ? "bg-brand-500/15 text-brand-300"
                    : item.soon
                    ? "text-ink-700 cursor-default"
                    : "text-ink-500 hover:bg-white/5 hover:text-ink-200"
                )}>
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.soon && <span className="text-[10px] text-ink-700 bg-white/5 px-1.5 py-0.5 rounded-full">Soon</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User */}
      {user && (
        <div className="border-t border-white/6 p-2.5">
          <div className="flex items-center gap-2.5 px-2.5 py-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500/20 text-brand-400 text-[11px] font-bold shrink-0">
              {user.first_name[0]}{user.last_name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-ink-200 truncate">{user.full_name}</p>
              <p className="text-[10px] text-ink-600 truncate">{user.email}</p>
            </div>
            <button onClick={handleLogout} className="text-ink-600 hover:text-ink-300 transition-colors p-1 rounded">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
SIDEBAR

write_file "web/src/app/dashboard/layout.tsx" << 'DASHLAYOUT'
import { Sidebar } from "@/components/layout/Sidebar";
import { Providers } from "@/components/layout/Providers";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </Providers>
  );
}
DASHLAYOUT

# ══════════════════════════════════════════════════════════════════════════════
# AUTH PAGES
# ══════════════════════════════════════════════════════════════════════════════

write_file "web/src/app/auth/login/page.tsx" << 'LOGINPAGE'
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mic2, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="w-full max-w-sm animate-fade-up">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 shadow-lg shadow-brand-500/30">
            <Mic2 className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-xl text-ink-100">FreedomPodcasting</span>
        </div>

        <div className="glass rounded-2xl p-8">
          <h1 className="font-display text-2xl text-ink-100 mb-1">Welcome back</h1>
          <p className="text-sm text-ink-500 mb-6">Sign in to your production studio</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" loading={isLoading}>
              Sign in <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-ink-600 mt-5">
          No account?{" "}
          <Link href="/auth/register" className="text-brand-400 hover:text-brand-300 transition-colors">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
LOGINPAGE

write_file "web/src/app/auth/register/page.tsx" << 'REGISTERPAGE'
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mic2, ArrowRight } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const router   = useRouter();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "", password_confirmation: "" });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.password_confirmation) { setError("Passwords don't match."); return; }
    setLoading(true);
    try {
      await authApi.register(form);
      await login(form.email, form.password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors?.[0];
      setError(msg ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="w-full max-w-sm animate-fade-up">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 shadow-lg shadow-brand-500/30">
            <Mic2 className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-xl text-ink-100">FreedomPodcasting</span>
        </div>

        <div className="glass rounded-2xl p-8">
          <h1 className="font-display text-2xl text-ink-100 mb-1">Start creating</h1>
          <p className="text-sm text-ink-500 mb-6">Your podcast studio awaits</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First name" placeholder="Jane" value={form.first_name} onChange={set("first_name")} required />
              <Input label="Last name"  placeholder="Doe"  value={form.last_name}  onChange={set("last_name")}  required />
            </div>
            <Input label="Email"    type="email"    placeholder="you@example.com" value={form.email}    onChange={set("email")}    required />
            <Input label="Password" type="password" placeholder="8+ characters"   value={form.password} onChange={set("password")} required minLength={8} />
            <Input label="Confirm password" type="password" placeholder="••••••••" value={form.password_confirmation} onChange={set("password_confirmation")} required />

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">{error}</div>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Create account <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-ink-600 mt-5">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
REGISTERPAGE

# ══════════════════════════════════════════════════════════════════════════════
# DASHBOARD HOME
# ══════════════════════════════════════════════════════════════════════════════

write_file "web/src/app/dashboard/page.tsx" << 'DASHPAGE'
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Radio, Upload, Rss, Plus, ArrowRight, Mic2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { podcastsApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Podcast } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, currentOrg, token } = useAuthStore();

  useEffect(() => {
    if (!token) router.push("/auth/login");
  }, [token, router]);

  const { data } = useQuery({
    queryKey: ["podcasts", currentOrg?.slug],
    queryFn:  () => podcastsApi.list(currentOrg!.slug).then((r) => r.data.data as Podcast[]),
    enabled:  !!currentOrg,
  });

  const podcasts = data ?? [];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10 animate-fade-up">
        <p className="text-ink-500 text-sm mb-1">{greeting}</p>
        <h1 className="font-display text-3xl text-ink-100">{user?.first_name ?? "there"} <span className="text-gradient">✦</span></h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "Podcasts", value: podcasts.length, icon: Radio },
          { label: "Published", value: podcasts.filter((p) => p.published).length, icon: Rss },
          { label: "Total Episodes", value: podcasts.reduce((s, p) => s + p.episode_count, 0), icon: Mic2 },
        ].map((stat, i) => (
          <div key={i} className="glass rounded-xl p-5 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-ink-500 uppercase tracking-wider">{stat.label}</span>
              <stat.icon className="h-4 w-4 text-ink-700" />
            </div>
            <p className="font-display text-3xl text-ink-100">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Podcasts section */}
      <div className="animate-fade-up" style={{ animationDelay: "180ms" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-ink-200">Your Podcasts</h2>
          <Button variant="secondary" size="sm" onClick={() => router.push("/dashboard/podcasts/new")}>
            <Plus className="h-3.5 w-3.5" /> New Podcast
          </Button>
        </div>

        {podcasts.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/15 mx-auto mb-4">
              <Mic2 className="h-7 w-7 text-brand-400" />
            </div>
            <h3 className="font-display text-xl text-ink-200 mb-2">No podcasts yet</h3>
            <p className="text-sm text-ink-500 mb-6 max-w-xs mx-auto">Create your first podcast to get an RSS feed and start publishing episodes.</p>
            <Button onClick={() => router.push("/dashboard/podcasts/new")}>
              <Plus className="h-4 w-4" /> Create your first podcast
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {podcasts.map((podcast) => (
              <Link key={podcast.id} href={`/dashboard/podcasts/${podcast.slug}`}
                className="glass glass-hover rounded-xl p-4 flex items-center gap-4 group">
                {podcast.artwork_url ? (
                  <img src={podcast.artwork_url} alt={podcast.title} className="h-12 w-12 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-brand-500/15 flex items-center justify-center shrink-0">
                    <Mic2 className="h-6 w-6 text-brand-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-ink-200 truncate">{podcast.title}</p>
                    <Badge variant={podcast.published ? "success" : "default"}>
                      {podcast.published ? "Live" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-xs text-ink-600">{podcast.episode_count} episodes · {podcast.author}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-ink-600">
                    <Rss className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">RSS</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-ink-700 group-hover:text-ink-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="mt-8 grid grid-cols-2 gap-3 animate-fade-up" style={{ animationDelay: "240ms" }}>
        <Link href="/dashboard/upload" className="glass glass-hover rounded-xl p-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/15">
            <Upload className="h-4 w-4 text-brand-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-ink-200">Upload Audio</p>
            <p className="text-xs text-ink-600">Add a new episode</p>
          </div>
        </Link>
        <Link href="/dashboard/podcasts" className="glass glass-hover rounded-xl p-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/15">
            <Radio className="h-4 w-4 text-brand-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-ink-200">Manage Shows</p>
            <p className="text-xs text-ink-600">Edit podcasts & episodes</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
DASHPAGE

# ══════════════════════════════════════════════════════════════════════════════
# PODCAST PAGES
# ══════════════════════════════════════════════════════════════════════════════

write_file "web/src/app/dashboard/podcasts/page.tsx" << 'PODCASTSPAGE'
"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus, Mic2, ArrowRight, Rss, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/lib/store";
import { podcastsApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Podcast } from "@/types";

export default function PodcastsPage() {
  const router = useRouter();
  const { currentOrg } = useAuthStore();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["podcasts", currentOrg?.slug],
    queryFn:  () => podcastsApi.list(currentOrg!.slug).then((r) => r.data.data as Podcast[]),
    enabled:  !!currentOrg,
  });

  const copyRss = async (podcast: Podcast) => {
    await navigator.clipboard.writeText(podcast.rss_url);
    setCopiedId(podcast.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl text-ink-100 mb-1">Podcasts</h1>
          <p className="text-sm text-ink-500">Manage your shows and RSS feeds</p>
        </div>
        <Button onClick={() => router.push("/dashboard/podcasts/new")}>
          <Plus className="h-4 w-4" /> New Podcast
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3].map((i) => <div key={i} className="glass rounded-xl h-20 shimmer-bg" />)}
        </div>
      ) : (data ?? []).length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <Mic2 className="h-10 w-10 text-ink-700 mx-auto mb-4" />
          <h3 className="font-display text-xl text-ink-300 mb-2">No podcasts yet</h3>
          <p className="text-sm text-ink-600 mb-6">Create your first podcast to get started.</p>
          <Button onClick={() => router.push("/dashboard/podcasts/new")}><Plus className="h-4 w-4" /> Create Podcast</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {(data ?? []).map((podcast) => (
            <div key={podcast.id} className="glass rounded-xl p-4 flex items-center gap-4 group">
              {podcast.artwork_url ? (
                <img src={podcast.artwork_url} alt={podcast.title} className="h-14 w-14 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="h-14 w-14 rounded-xl bg-brand-500/15 flex items-center justify-center shrink-0">
                  <Mic2 className="h-7 w-7 text-brand-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-ink-200">{podcast.title}</p>
                  <Badge variant={podcast.published ? "success" : "default"}>{podcast.published ? "Live" : "Draft"}</Badge>
                </div>
                <p className="text-xs text-ink-600 truncate">{podcast.episode_count} episodes · {podcast.category ?? "Uncategorized"}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <code className="text-[10px] text-ink-600 font-mono truncate max-w-xs">{podcast.rss_url}</code>
                  <button onClick={() => copyRss(podcast)} className="text-ink-600 hover:text-brand-400 transition-colors p-0.5">
                    {copiedId === podcast.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={podcast.rss_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-brand-400 transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
                  <Rss className="h-3.5 w-3.5" /> RSS
                </a>
                <Link href={`/dashboard/podcasts/${podcast.slug}`}
                  className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-200 transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
                  Manage <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
PODCASTSPAGE

write_file "web/src/app/dashboard/podcasts/new/page.tsx" << 'NEWPODCAST'
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { podcastsApi } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { toast } from "@/lib/toast";

const CATEGORIES = ["Arts","Business","Comedy","Education","Fiction","Government","Health & Fitness","History","Kids & Family","Leisure","Music","News","Religion & Spirituality","Science","Society & Culture","Sports","Technology","True Crime","TV & Film"];

export default function NewPodcastPage() {
  const router = useRouter();
  const { currentOrg } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    title: "", description: "", author: "", email: "",
    slug: "", language: "en", category: "", explicit: false,
    podcast_type: "episodic", website_url: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm((f) => ({ ...f, title, slug: f.slug || autoSlug(title) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg) return;
    setLoading(true);
    setErrors({});
    try {
      const res = await podcastsApi.create(currentOrg.slug, form);
      toast.success("Podcast created!", "Your RSS feed is ready.");
      router.push(`/dashboard/podcasts/${res.data.data.slug}`);
    } catch (err: unknown) {
      const errs = (err as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors;
      if (errs) setErrors({ _base: errs.join(", ") });
      else toast.error("Failed to create podcast");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-300 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h1 className="font-display text-2xl text-ink-100 mb-1">New Podcast</h1>
      <p className="text-sm text-ink-500 mb-8">Set up your show — you can edit everything later</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Basic Info</h2>
          <Input label="Podcast title *" placeholder="My Awesome Podcast" value={form.title} onChange={handleTitleChange} required />
          <Textarea label="Description *" placeholder="Tell listeners what your show is about..." value={form.description} onChange={set("description")} rows={4} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Author / Host *" placeholder="Jane Doe" value={form.author} onChange={set("author")} required />
            <Input label="Contact email *" type="email" placeholder="host@example.com" value={form.email} onChange={set("email")} required />
          </div>
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">RSS Settings</h2>
          <Input label="URL slug *" placeholder="my-awesome-podcast" value={form.slug} onChange={set("slug")} required
            hint="This forms your RSS feed URL: feeds/my-awesome-podcast" />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink-300">Category</label>
              <select value={form.category} onChange={set("category")}
                className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 text-ink-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40">
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink-300">Type</label>
              <select value={form.podcast_type} onChange={set("podcast_type")}
                className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 text-ink-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40">
                <option value="episodic">Episodic</option>
                <option value="serial">Serial</option>
              </select>
            </div>
          </div>
          <Input label="Website URL" type="url" placeholder="https://mypodcast.com" value={form.website_url} onChange={set("website_url")} />
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input type="checkbox" checked={form.explicit} onChange={(e) => setForm((f) => ({ ...f, explicit: e.target.checked }))}
              className="w-4 h-4 rounded bg-white/5 border border-white/10 accent-brand-500" />
            <span className="text-sm text-ink-400 group-hover:text-ink-300 transition-colors">Explicit content</span>
          </label>
        </div>

        {errors._base && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{errors._base}</div>
        )}

        <div className="flex items-center gap-3 justify-end">
          <Button variant="secondary" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={loading}>Create Podcast</Button>
        </div>
      </form>
    </div>
  );
}
NEWPODCAST

write_file "web/src/app/dashboard/podcasts/[slug]/page.tsx" << 'PODCASTDETAIL'
"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Rss, Copy, Check, Globe, GlobeLock, Pencil, Trash2, Clock, Mic2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { podcastsApi, episodesApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "@/lib/toast";
import type { Podcast, Episode } from "@/types";

function formatDuration(secs?: number) {
  if (!secs) return null;
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
  return h > 0 ? `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}` : `${m}:${String(s).padStart(2,"0")}`;
}

export default function PodcastDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { currentOrg } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const { data: podcast, isLoading } = useQuery<Podcast>({
    queryKey: ["podcast", currentOrg?.slug, slug],
    queryFn:  () => podcastsApi.get(currentOrg!.slug, slug).then((r) => r.data.data),
    enabled:  !!currentOrg,
  });

  const { data: episodesData } = useQuery({
    queryKey: ["episodes", currentOrg?.slug, slug],
    queryFn:  () => episodesApi.list(currentOrg!.slug, slug).then((r) => r.data),
    enabled:  !!currentOrg,
  });

  const togglePublish = useMutation({
    mutationFn: () => podcast?.published
      ? podcastsApi.unpublish(currentOrg!.slug, slug)
      : podcastsApi.publish(currentOrg!.slug, slug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["podcast", currentOrg?.slug, slug] });
      qc.invalidateQueries({ queryKey: ["podcasts", currentOrg?.slug] });
      toast.success(podcast?.published ? "Podcast unpublished" : "Podcast is now live!");
    },
  });

  const deleteEpisode = useMutation({
    mutationFn: (id: number) => episodesApi.delete(currentOrg!.slug, slug, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["episodes", currentOrg?.slug, slug] });
      toast.success("Episode deleted");
    },
  });

  const copyRss = async () => {
    if (!podcast) return;
    await navigator.clipboard.writeText(podcast.rss_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const episodes: Episode[] = episodesData?.data ?? [];

  if (isLoading) return <div className="p-8"><div className="glass rounded-2xl h-48 shimmer-bg" /></div>;
  if (!podcast) return <div className="p-8 text-ink-500">Podcast not found.</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-300 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> All Podcasts
      </button>

      {/* Podcast header */}
      <div className="glass rounded-2xl p-6 mb-6 flex items-start gap-5">
        {podcast.artwork_url ? (
          <img src={podcast.artwork_url} alt={podcast.title} className="h-20 w-20 rounded-xl object-cover shrink-0" />
        ) : (
          <div className="h-20 w-20 rounded-xl bg-brand-500/15 flex items-center justify-center shrink-0">
            <Mic2 className="h-10 w-10 text-brand-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="font-display text-2xl text-ink-100">{podcast.title}</h1>
            <Badge variant={podcast.published ? "success" : "default"}>{podcast.published ? "Live" : "Draft"}</Badge>
          </div>
          <p className="text-sm text-ink-500 mb-3 line-clamp-2">{podcast.description}</p>
          <div className="flex items-center gap-1.5">
            <code className="text-xs text-ink-600 font-mono truncate max-w-xs">{podcast.rss_url}</code>
            <button onClick={copyRss} className="text-ink-600 hover:text-brand-400 transition-colors p-1">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <a href={podcast.rss_url} target="_blank" rel="noopener noreferrer" className="text-ink-600 hover:text-brand-400 transition-colors p-1">
              <Rss className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="secondary" size="sm" onClick={() => router.push(`/dashboard/podcasts/${slug}/edit`)}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button
            variant={podcast.published ? "secondary" : "primary"}
            size="sm"
            loading={togglePublish.isPending}
            onClick={() => togglePublish.mutate()}>
            {podcast.published ? <><GlobeLock className="h-3.5 w-3.5" /> Unpublish</> : <><Globe className="h-3.5 w-3.5" /> Publish</>}
          </Button>
        </div>
      </div>

      {/* Episodes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-ink-200">Episodes <span className="text-ink-600 text-base font-sans">({episodes.length})</span></h2>
          <Button size="sm" onClick={() => router.push(`/dashboard/podcasts/${slug}/episodes/new`)}>
            <Plus className="h-3.5 w-3.5" /> New Episode
          </Button>
        </div>

        {episodes.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <Mic2 className="h-8 w-8 text-ink-700 mx-auto mb-3" />
            <p className="text-ink-400 text-sm mb-4">No episodes yet. Add your first one!</p>
            <Button size="sm" onClick={() => router.push(`/dashboard/podcasts/${slug}/episodes/new`)}>
              <Plus className="h-3.5 w-3.5" /> Add Episode
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {episodes.map((ep) => (
              <div key={ep.id} className="glass glass-hover rounded-xl px-4 py-3.5 flex items-center gap-3 group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-[11px] font-mono text-ink-600">
                      {ep.season_number ? `S${ep.season_number}·` : ""}E{ep.episode_number ?? "—"}
                    </span>
                    <p className="text-sm font-medium text-ink-200 truncate">{ep.title}</p>
                    <Badge variant={ep.status === "published" ? "success" : ep.status === "scheduled" ? "warning" : "default"}>
                      {ep.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-ink-600">
                    {ep.formatted_duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ep.formatted_duration}</span>}
                    {ep.published_at && <span>{new Date(ep.published_at).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Link href={`/dashboard/podcasts/${slug}/episodes/${ep.id}/edit`}
                    className="p-1.5 text-ink-600 hover:text-ink-300 hover:bg-white/5 rounded-lg transition-colors">
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                  <button onClick={() => { if (confirm("Delete this episode?")) deleteEpisode.mutate(ep.id); }}
                    className="p-1.5 text-ink-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
PODCASTDETAIL

# ══════════════════════════════════════════════════════════════════════════════
# EPISODE NEW/EDIT PAGE
# ══════════════════════════════════════════════════════════════════════════════

write_file "web/src/app/dashboard/podcasts/[slug]/episodes/new/page.tsx" << 'NEWEPISODE'
"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Mic2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { episodesApi, uploadsApi } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { AudioUploader } from "@/components/upload/AudioUploader";
import { toast } from "@/lib/toast";

export default function NewEpisodePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { currentOrg } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [audioData, setAudioData] = useState<{ mediaFileId: number; publicUrl: string } | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", summary: "",
    episode_type: "full", explicit: false, keywords: "",
    episode_number: "", season_number: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        audio_url: audioData?.publicUrl ?? null,
        episode_number: form.episode_number ? parseInt(form.episode_number) : null,
        season_number:  form.season_number  ? parseInt(form.season_number)  : null,
      };
      await episodesApi.create(currentOrg.slug, slug, payload);
      toast.success("Episode created!", audioData ? "Audio attached successfully." : "Add audio when ready.");
      router.push(`/dashboard/podcasts/${slug}`);
    } catch {
      toast.error("Failed to create episode");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-300 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to podcast
      </button>

      <h1 className="font-display text-2xl text-ink-100 mb-1">New Episode</h1>
      <p className="text-sm text-ink-500 mb-8">Upload your audio and fill in the details</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Audio upload */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Mic2 className="h-4 w-4 text-brand-400" />
            <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Audio File</h2>
          </div>
          {currentOrg && (
            <AudioUploader
              orgSlug={currentOrg.slug}
              podcastSlug={slug}
              onUploadComplete={(data) => {
                setAudioData(data);
                toast.success("Audio uploaded!", "Metadata will be extracted in the background.");
              }}
              onError={(err) => toast.error("Upload failed", err)}
            />
          )}
        </div>

        {/* Episode details */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Episode Details</h2>
          <Input label="Title *" placeholder="Episode title" value={form.title} onChange={set("title")} required />
          <Textarea label="Description / Show Notes *" placeholder="What's this episode about? Markdown supported." value={form.description} onChange={set("description")} rows={5} required />
          <Textarea label="Summary" placeholder="Short plain-text summary (shown in podcast apps)" value={form.summary} onChange={set("summary")} rows={2} />
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink-300">Type</label>
              <select value={form.episode_type} onChange={set("episode_type")}
                className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 text-ink-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40">
                <option value="full">Full</option>
                <option value="trailer">Trailer</option>
                <option value="bonus">Bonus</option>
              </select>
            </div>
            <Input label="Episode #" type="number" placeholder="1" value={form.episode_number} onChange={set("episode_number")} min="1" />
            <Input label="Season #"  type="number" placeholder="1" value={form.season_number}  onChange={set("season_number")}  min="1" />
          </div>
          <Input label="Keywords" placeholder="tech, business, startup (comma-separated)" value={form.keywords} onChange={set("keywords")} />
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input type="checkbox" checked={form.explicit} onChange={(e) => setForm((f) => ({ ...f, explicit: e.target.checked }))}
              className="w-4 h-4 rounded bg-white/5 border border-white/10 accent-brand-500" />
            <span className="text-sm text-ink-400 group-hover:text-ink-300 transition-colors">Explicit content</span>
          </label>
        </div>

        <div className="flex items-center gap-3 justify-end">
          <Button variant="secondary" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={loading}>Save Episode</Button>
        </div>
      </form>
    </div>
  );
}
NEWEPISODE

# ══════════════════════════════════════════════════════════════════════════════
# AUDIO UPLOADER COMPONENT
# ══════════════════════════════════════════════════════════════════════════════

write_file "web/src/components/upload/AudioUploader.tsx" << 'AUDIOUPLOADER'
"use client";
import { useCallback, useState } from "react";
import { Upload, Loader2, CheckCircle2, XCircle, Music2 } from "lucide-react";
import { clsx } from "clsx";
import { uploadsApi } from "@/lib/api";
import type { PresignedUploadResponse } from "@/types";

interface Props {
  orgSlug: string;
  podcastSlug: string;
  episodeId?: number;
  onUploadComplete: (data: { mediaFileId: number; publicUrl: string }) => void;
  onError?: (error: string) => void;
}

type State = "idle" | "uploading" | "processing" | "complete" | "error";

const ACCEPTED = ["audio/mpeg","audio/mp4","audio/ogg","audio/wav","audio/x-wav","audio/flac"];
const MAX_BYTES = 500 * 1024 * 1024;

export function AudioUploader({ orgSlug, podcastSlug, episodeId, onUploadComplete, onError }: Props) {
  const [state,    setState]    = useState<State>("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [isDrag,   setIsDrag]   = useState(false);
  const [errMsg,   setErrMsg]   = useState("");

  const handle = useCallback(async (file: File) => {
    if (!ACCEPTED.includes(file.type)) {
      const msg = `Unsupported type: ${file.type}`;
      setErrMsg(msg); setState("error"); onError?.(msg); return;
    }
    if (file.size > MAX_BYTES) {
      const msg = "File too large (max 500MB)";
      setErrMsg(msg); setState("error"); onError?.(msg); return;
    }
    setFileName(file.name); setState("uploading"); setProgress(0);
    try {
      const presignRes = await uploadsApi.presign(orgSlug, podcastSlug, { filename: file.name, content_type: file.type, upload_type: "audio" });
      const presign: PresignedUploadResponse = presignRes.data.data;
      await uploadsApi.uploadToR2(presign.presigned_url, file, setProgress);
      setState("processing");
      const completeRes = await uploadsApi.complete(orgSlug, podcastSlug, { media_file_id: presign.media_file_id, episode_id: episodeId, file_size: file.size });
      setState("complete");
      onUploadComplete({ mediaFileId: completeRes.data.data.media_file_id, publicUrl: completeRes.data.data.public_url });
    } catch {
      const msg = "Upload failed — please try again";
      setErrMsg(msg); setState("error"); onError?.(msg);
    }
  }, [orgSlug, podcastSlug, episodeId, onUploadComplete, onError]);

  const reset = () => { setState("idle"); setProgress(0); setFileName(""); setErrMsg(""); };

  return (
    <div className="w-full">
      {state === "idle" && (
        <label
          className={clsx("flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200",
            isDrag ? "border-brand-500 bg-brand-500/10" : "border-white/10 hover:border-brand-500/40 hover:bg-white/3")}
          onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
          onDragLeave={() => setIsDrag(false)}
          onDrop={(e) => { e.preventDefault(); setIsDrag(false); const f = e.dataTransfer.files[0]; if (f) handle(f); }}>
          <input type="file" className="hidden" accept={ACCEPTED.join(",")} onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); }} />
          <div className="flex flex-col items-center gap-3 text-center px-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500/15">
              <Upload className="h-5 w-5 text-brand-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink-300">Drop audio here or <span className="text-brand-400">browse</span></p>
              <p className="text-xs text-ink-600 mt-0.5">MP3, MP4, OGG, WAV, FLAC · max 500MB</p>
            </div>
          </div>
        </label>
      )}

      {(state === "uploading" || state === "processing") && (
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 shrink-0">
              <Music2 className="h-5 w-5 text-brand-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink-200 truncate">{fileName}</p>
              <p className="text-xs text-ink-500 mt-0.5">{state === "uploading" ? `Uploading ${progress}%` : "Processing…"}</p>
              <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-white/8">
                <div className="h-full rounded-full bg-brand-500 transition-all duration-300"
                  style={{ width: state === "uploading" ? `${progress}%` : "100%" }} />
              </div>
            </div>
            {state === "processing" && <Loader2 className="h-4 w-4 animate-spin text-brand-400 shrink-0" />}
          </div>
        </div>
      )}

      {state === "complete" && (
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/8 p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-emerald-300">Upload complete</p>
            <p className="text-xs text-emerald-500 truncate mt-0.5">{fileName}</p>
          </div>
          <button onClick={reset} className="text-xs text-ink-600 hover:text-ink-400 transition-colors">Replace</button>
        </div>
      )}

      {state === "error" && (
        <div className="rounded-xl border border-red-500/25 bg-red-500/8 p-4 flex items-start gap-3">
          <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-300">Upload failed</p>
            <p className="text-xs text-red-500 mt-0.5">{errMsg}</p>
          </div>
          <button onClick={reset} className="text-xs text-ink-600 hover:text-ink-400 transition-colors shrink-0">Retry</button>
        </div>
      )}
    </div>
  );
}
AUDIOUPLOADER

# ══════════════════════════════════════════════════════════════════════════════
# PUBLIC PODCAST PAGE
# ══════════════════════════════════════════════════════════════════════════════

write_file "web/src/app/p/[slug]/page.tsx" << 'PUBLICPODCAST'
import { Mic2, Rss, ExternalLink, Clock } from "lucide-react";
import type { Metadata } from "next";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

async function getPodcast(slug: string) {
  const res = await fetch(`${API}/public/podcasts/${slug}`, { next: { revalidate: 300 } });
  if (!res.ok) return null;
  return res.json().then((d) => d.data);
}

async function getEpisodes(slug: string) {
  const res = await fetch(`${API}/public/podcasts/${slug}/episodes`, { next: { revalidate: 300 } });
  if (!res.ok) return [];
  return res.json().then((d) => d.data ?? []);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const podcast = await getPodcast(params.slug);
  if (!podcast) return { title: "Podcast Not Found" };
  return {
    title: podcast.title,
    description: podcast.description,
    openGraph: { title: podcast.title, description: podcast.description, images: podcast.artwork_url ? [podcast.artwork_url] : [] },
  };
}

export default async function PublicPodcastPage({ params }: { params: { slug: string } }) {
  const [podcast, episodes] = await Promise.all([getPodcast(params.slug), getEpisodes(params.slug)]);

  if (!podcast) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Mic2 className="h-12 w-12 text-ink-700 mx-auto mb-4" />
          <h1 className="font-display text-2xl text-ink-400 mb-2">Podcast not found</h1>
          <p className="text-ink-600 text-sm">This show may not be published yet.</p>
        </div>
      </div>
    );
  }

  const rssUrl = `${API}/feeds/${podcast.slug}`;

  return (
    <div className="min-h-screen">
      {/* Fixed background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-brand-500/6 blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Podcast header */}
        <div className="flex gap-6 mb-10">
          {podcast.artwork_url ? (
            <img src={podcast.artwork_url} alt={podcast.title} className="h-28 w-28 rounded-2xl object-cover shadow-2xl shadow-black/40 shrink-0" />
          ) : (
            <div className="h-28 w-28 rounded-2xl bg-brand-500/15 flex items-center justify-center shadow-2xl shadow-black/40 shrink-0">
              <Mic2 className="h-12 w-12 text-brand-400" />
            </div>
          )}
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-xs text-brand-400 uppercase tracking-wider font-semibold mb-1">{podcast.category}</p>
            <h1 className="font-display text-3xl text-ink-100 mb-1.5 leading-tight">{podcast.title}</h1>
            <p className="text-sm text-ink-500 mb-3">by {podcast.author}</p>
            <div className="flex flex-wrap items-center gap-2">
              <a href={rssUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass glass-hover text-xs font-medium text-ink-300 transition-colors">
                <Rss className="h-3.5 w-3.5 text-brand-400" /> Subscribe via RSS
              </a>
              {podcast.website_url && (
                <a href={podcast.website_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass glass-hover text-xs font-medium text-ink-300 transition-colors">
                  <ExternalLink className="h-3.5 w-3.5" /> Website
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-ink-400 text-sm leading-relaxed mb-10 max-w-2xl">{podcast.description}</p>

        {/* Episodes */}
        <div>
          <h2 className="font-display text-xl text-ink-200 mb-4">Episodes <span className="text-ink-600 font-sans text-base">({episodes.length})</span></h2>

          {episodes.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <p className="text-ink-600 text-sm">No episodes published yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {episodes.map((ep: { id: number; episode_number?: number; season_number?: number; title: string; summary?: string; description: string; audio_url?: string; audio_content_type?: string; audio_file_size?: number; audio_duration_seconds?: number; formatted_duration?: string; published_at?: string }) => (
                <div key={ep.id} className="glass rounded-xl p-4 group">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {ep.episode_number && (
                          <span className="text-[10px] font-mono text-ink-600">
                            {ep.season_number ? `S${ep.season_number}·` : ""}E{ep.episode_number}
                          </span>
                        )}
                        <h3 className="text-sm font-medium text-ink-200">{ep.title}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-ink-600 mt-1">
                        {ep.formatted_duration && (
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ep.formatted_duration}</span>
                        )}
                        {ep.published_at && <span>{new Date(ep.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>}
                      </div>
                    </div>
                  </div>

                  {ep.summary && <p className="text-xs text-ink-500 mb-3 line-clamp-2">{ep.summary}</p>}

                  {ep.audio_url && (
                    <audio controls className="w-full h-8" style={{ accentColor: "#ec4899" }}>
                      <source src={ep.audio_url} type={ep.audio_content_type ?? "audio/mpeg"} />
                    </audio>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/6 text-center">
          <p className="text-xs text-ink-700">
            Hosted on <a href="https://freedompodcasting.com" className="text-ink-500 hover:text-brand-400 transition-colors">FreedomPodcasting</a>
          </p>
        </div>
      </div>
    </div>
  );
}
PUBLICPODCAST

# ══════════════════════════════════════════════════════════════════════════════
# SETTINGS PAGE
# ══════════════════════════════════════════════════════════════════════════════

write_file "web/src/app/dashboard/settings/page.tsx" << 'SETTINGS'
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
SETTINGS

# ══════════════════════════════════════════════════════════════════════════════
# RAILS: Public podcasts controller (needed for public page SSR)
# ══════════════════════════════════════════════════════════════════════════════

mkdir -p api/app/controllers/public

cat > api/app/controllers/public/podcasts_controller.rb << 'PUBLICPODCASTS'
module Public
  class PodcastsController < ActionController::API
    # GET /public/podcasts/:slug
    def show
      podcast = Podcast.published.find_by!(slug: params[:slug])
      render json: { data: podcast_json(podcast) }
    end

    # GET /public/podcasts/:slug/episodes
    def episodes
      podcast  = Podcast.published.find_by!(slug: params[:slug])
      episodes = podcast.published_episodes.limit(100)
      render json: { data: episodes.map { |e| episode_json(e) } }
    end

    private

    def podcast_json(p)
      { id: p.id, title: p.title, description: p.description, author: p.author,
        slug: p.slug, artwork_url: p.artwork_url, language: p.language,
        category: p.category, website_url: p.website_url, explicit: p.explicit,
        podcast_type: p.podcast_type, episode_count: p.published_episodes.count }
    end

    def episode_json(e)
      { id: e.id, title: e.title, description: e.description, summary: e.summary,
        audio_url: e.audio_url, audio_content_type: e.audio_content_type,
        audio_file_size: e.audio_file_size, audio_duration_seconds: e.audio_duration_seconds,
        formatted_duration: e.formatted_duration, episode_number: e.episode_number,
        season_number: e.season_number, episode_type: e.episode_type,
        explicit: e.explicit, published_at: e.published_at, guid: e.guid }
    end
  end
end
PUBLICPODCASTS

echo ""
echo "✅ Session 2 complete! Files created:"
echo ""
echo "  Web (Next.js):"
echo "    web/src/app/auth/login/page.tsx"
echo "    web/src/app/auth/register/page.tsx"
echo "    web/src/app/dashboard/page.tsx"
echo "    web/src/app/dashboard/podcasts/page.tsx"
echo "    web/src/app/dashboard/podcasts/new/page.tsx"
echo "    web/src/app/dashboard/podcasts/[slug]/page.tsx"
echo "    web/src/app/dashboard/podcasts/[slug]/episodes/new/page.tsx"
echo "    web/src/app/dashboard/settings/page.tsx"
echo "    web/src/app/p/[slug]/page.tsx  (public podcast page)"
echo "    web/src/components/* (Button, Input, Textarea, Badge, Toaster, Sidebar, AudioUploader)"
echo ""
echo "  Rails:"
echo "    api/app/controllers/public/podcasts_controller.rb"
echo ""
echo "Next steps:"
echo "  cd web && npm install"
echo "  git add -A && git commit -m 'feat: auth pages, dashboard, podcast/episode UI, public page'"
echo "  git push"
