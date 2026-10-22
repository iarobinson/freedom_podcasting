export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  confirmed_at: string | null;
  is_staff: boolean;
  staff_role: "admin" | "editor" | null;
  organizations: OrganizationSummary[];
}

export interface StaffOrgSummary {
  id: number;
  name: string;
  slug: string;
  plan: Plan;
  podcast_count: number;
  created_at: string;
}

export interface StaffOrgListMeta {
  total: number;
  page: number;
  per_page: number;
}

export interface OrganizationSummary {
  id: number;
  name: string;
  slug: string;
  plan: Plan;
  role: Role;
}

export interface PendingInvitation {
  email: string;
  role: Exclude<Role, "owner">;
  invited_at: string;
  expired: boolean;
}

export interface ActivityItem {
  kind: "podcast_created" | "podcast_published" | "episode_created" | "episode_published" | "invite_sent";
  at: string;
  text: string;
  podcast_slug?: string;
  episode_id?: number;
}

export interface OrgOverview {
  stats: {
    podcasts: number;
    published_episodes: number;
    draft_episodes: number;
    storage_used_bytes: number;
    storage_limit_bytes: number;
  };
  setup: {
    has_podcast: boolean;
    missing_artwork_slug: string | null;
    has_episode: boolean;
    has_published: boolean;
    unsubmitted_slug: string | null;
    has_teammate: boolean;
    at_publish_limit: boolean;
  };
  activity: ActivityItem[];
}

export interface UsageMeter { used: number; limit: number }

export interface BillingSummary {
  plan: Plan;
  billing_interval: "month" | "year";
  renews_at: string | null;
  usage: { podcasts: UsageMeter; members: UsageMeter; storage_bytes: UsageMeter };
}

export type Plan = "free" | "archive" | "starter" | "pro" | "agency";
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
  apple_podcasts_url?: string;
  spotify_url?: string;
  amazon_music_url?: string;
  created_at: string;
  updated_at: string;
}

export type EpisodeStatus = "draft" | "review" | "approved" | "scheduled" | "published";
export type EpisodeType   = "full" | "trailer" | "bonus";

export interface Episode {
  id: number;
  slug?: string;
  title: string;
  description: string;
  summary?: string;
  artwork_url?: string;
  audio_url?: string;
  audio_filename?: string;
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
  review_notes?: string;
  reviewed_at?: string;
  guid: string;
  download_count: number;
  created_at: string;
  updated_at: string;
  transcript?: string;
  transcription_status?: "pending" | "processing" | "done" | "failed";
  show_notes_ai?: string;
  show_notes_ai_status?: "pending" | "processing" | "done" | "failed";
  ai_metadata_status?: "pending" | "processing" | "done" | "failed";
  ai_purchased_at?: string;
  waveform_peaks?: number[];
}

export interface Member {
  user_id: number;
  email: string;
  full_name: string;
  role: Role;
  invited_at: string | null;
  accepted_at: string | null;
}

export interface PresignedUploadResponse {
  media_file_id: number;
  presigned_url: string;
  r2_key: string;
  expires_in: number;
}

export interface PodcastImport {
  id: number;
  status: "pending" | "processing" | "done" | "failed";
  rss_url: string;
  total_episodes: number;
  imported_episodes: number;
  skipped_episodes: number;
  podcast_id?: number;
  podcast_slug?: string;
  error_message?: string;
  created_at: string;
}
