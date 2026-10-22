import axios, { AxiosError } from "axios";
import type { BillingSummary, OrgOverview, PendingInvitation } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
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
    const status = error.response?.status;
    const url = error.config?.url;
    const isAuthRoute = url?.includes("/auth/login") || url?.includes("/auth/register");

    // Log all API errors for debugging
    if (status && status >= 500) {
      console.error(`[api] Server error ${status} on ${url}`, error.response?.data);
    } else if (!status) {
      console.error(`[api] Network error on ${url}:`, error.message);
    }

    if (status === 401 && !isAuthRoute && typeof window !== "undefined") {
      localStorage.removeItem("fp_token");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login:    (email: string, password: string) =>
    apiClient.post("/api/v1/auth/login", { user: { email, password } }),
  register: (data: { email: string; password: string; password_confirmation: string; first_name: string; last_name: string; invitation_token?: string }) =>
    apiClient.post("/api/v1/auth/register", { user: data }),
  logout: () => apiClient.delete("/api/v1/auth/logout"),
  me:     () => apiClient.get("/api/v1/auth/me"),
  updateMe: (data: { first_name: string; last_name: string }) =>
    apiClient.patch("/api/v1/auth/me", { user: data }),
  forgotPassword: (email: string) =>
    apiClient.post("/api/v1/auth/password", { email }),
  resetPassword: (reset_password_token: string, password: string, password_confirmation: string) =>
    apiClient.put("/api/v1/auth/password", { reset_password_token, password, password_confirmation }),
  confirmEmail: (token: string) =>
    apiClient.get(`/api/v1/auth/confirm?token=${encodeURIComponent(token)}`),
  resendConfirmation: () =>
    apiClient.post("/api/v1/auth/resend-confirmation"),
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
  publish:         (orgSlug: string, podcastSlug: string, id: number) => apiClient.post(`/api/v1/organizations/${orgSlug}/podcasts/${podcastSlug}/episodes/${id}/publish`),
  unpublish:       (orgSlug: string, podcastSlug: string, id: number) => apiClient.post(`/api/v1/organizations/${orgSlug}/podcasts/${podcastSlug}/episodes/${id}/unpublish`),
  submitForReview: (orgSlug: string, podcastSlug: string, id: number) => apiClient.post(`/api/v1/organizations/${orgSlug}/podcasts/${podcastSlug}/episodes/${id}/submit_for_review`),
  approve:         (orgSlug: string, podcastSlug: string, id: number) => apiClient.post(`/api/v1/organizations/${orgSlug}/podcasts/${podcastSlug}/episodes/${id}/approve`),
  reject:          (orgSlug: string, podcastSlug: string, id: number, notes: string) => apiClient.post(`/api/v1/organizations/${orgSlug}/podcasts/${podcastSlug}/episodes/${id}/reject`, { notes }),
  transcribe:        (orgSlug: string, podcastSlug: string, id: number) => apiClient.post(`/api/v1/organizations/${orgSlug}/podcasts/${podcastSlug}/episodes/${id}/transcribe`),
  generateShowNotes: (orgSlug: string, podcastSlug: string, id: number) => apiClient.post(`/api/v1/organizations/${orgSlug}/podcasts/${podcastSlug}/episodes/${id}/generate_show_notes`),
  checkoutAi:        (orgSlug: string, podcastSlug: string, id: number) => apiClient.post(`/api/v1/organizations/${orgSlug}/podcasts/${podcastSlug}/episodes/${id}/checkout_ai`),
  suggestTitles:     (orgSlug: string, podcastSlug: string, id: number) => apiClient.post(`/api/v1/organizations/${orgSlug}/podcasts/${podcastSlug}/episodes/${id}/suggest_titles`),
  suggestClips:      (orgSlug: string, podcastSlug: string, id: number) => apiClient.post(`/api/v1/organizations/${orgSlug}/podcasts/${podcastSlug}/episodes/${id}/suggest_clips`),
};

export const membersApi = {
  list:       (orgSlug: string) =>
                apiClient.get(`/api/v1/organizations/${orgSlug}/members`),
  invite:     (orgSlug: string, email: string, role: string) =>
                apiClient.post(`/api/v1/organizations/${orgSlug}/invite`, { email, role }),
  remove:     (orgSlug: string, userId: number) =>
                apiClient.delete(`/api/v1/organizations/${orgSlug}/members/${userId}`),
  updateRole: (orgSlug: string, userId: number, role: string) =>
                apiClient.patch(`/api/v1/organizations/${orgSlug}/members/${userId}/role`, { role }),
  accept:     (token: string) =>
                apiClient.post(`/api/v1/invitations/accept`, { token }),
  pending:    (orgSlug: string) =>
                apiClient.get<{ data: PendingInvitation[] }>(`/api/v1/organizations/${orgSlug}/invitations`),
  resend:     (orgSlug: string, email: string) =>
                apiClient.post(`/api/v1/organizations/${orgSlug}/invitations/resend`, { email }),
  revoke:     (orgSlug: string, email: string) =>
                apiClient.delete(`/api/v1/organizations/${orgSlug}/invitations`, { data: { email } }),
};

export const organizationsApi = {
  overview: (orgSlug: string) =>
    apiClient.get<{ data: OrgOverview }>(`/api/v1/organizations/${orgSlug}/overview`),
  update:   (orgSlug: string, data: { name: string }) =>
    apiClient.patch(`/api/v1/organizations/${orgSlug}`, { organization: data }),
};

export const billingApi = {
  summary: (orgSlug: string) =>
    apiClient.get<{ data: BillingSummary }>(`/api/v1/organizations/${orgSlug}/billing/summary`),
  checkout: (orgSlug: string, plan: string, interval: "month" | "year" = "month") =>
    apiClient.post(`/api/v1/organizations/${orgSlug}/billing/checkout`, { plan, interval }),
  portal: (orgSlug: string) =>
    apiClient.post(`/api/v1/organizations/${orgSlug}/billing/portal`),
  cancel: (orgSlug: string) =>
    apiClient.post(`/api/v1/organizations/${orgSlug}/billing/cancel`),
};

export const podcastImportsApi = {
  create: (orgSlug: string, rss_url: string) =>
    apiClient.post(`/api/v1/organizations/${orgSlug}/podcast_imports`, { rss_url }),
  get: (orgSlug: string, id: number) =>
    apiClient.get(`/api/v1/organizations/${orgSlug}/podcast_imports/${id}`),
};

export const wordpressTokensApi = {
  create: (orgSlug: string, callbackUrl: string, name?: string) =>
    apiClient.post(`/api/v1/wordpress/organizations/${orgSlug}/tokens`, {
      callback_url: callbackUrl,
      ...(name ? { name } : {}),
    }),
  list:   (orgSlug: string) =>
    apiClient.get(`/api/v1/wordpress/organizations/${orgSlug}/tokens`),
  revoke: (orgSlug: string, tokenId: number) =>
    apiClient.delete(`/api/v1/wordpress/organizations/${orgSlug}/tokens/${tokenId}`),
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

export const staffApi = {
  listOrgs: (params?: { page?: number; q?: string }) =>
    apiClient.get("/api/v1/staff/organizations", { params }),
  createOrg: (data: { organization: { name: string; slug?: string }; plan?: string; rss_url?: string }) =>
    apiClient.post("/api/v1/staff/organizations", data),
  generateCheckoutLink: (org_slug: string, price_cents: number, test = false, plan = "starter", interval: "month" | "year" = "month") =>
    apiClient.post("/api/v1/staff/checkout_links", { org_slug, price_cents, test, plan, interval }),
};

// No auth header — used for public client-facing pages
const publicClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

export const publicCheckoutApi = {
  getInfo: (token: string) =>
    publicClient.get(`/api/v1/public/checkout/${token}`),
  createSession: (token: string) =>
    publicClient.post(`/api/v1/public/checkout/${token}`),
};
