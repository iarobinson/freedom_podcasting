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
    const isAuthRoute = error.config?.url?.includes("/auth/login") || error.config?.url?.includes("/auth/register");
    if (error.response?.status === 401 && !isAuthRoute && typeof window !== "undefined") {
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
  forgotPassword: (email: string) =>
    apiClient.post("/api/v1/auth/password", { email }),
  resetPassword: (reset_password_token: string, password: string, password_confirmation: string) =>
    apiClient.put("/api/v1/auth/password", { reset_password_token, password, password_confirmation }),
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
