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
