# FreedomPodcasting — Master Project Plan

## Vision
A SaaS podcast production platform for FreedomPodcasting.com that allows anyone to
host their show, with AI-powered production tools built in over time.

## Core Principles (from workflow)
- Plan before building. Stop and re-plan if something goes sideways.
- Verify before marking complete.
- Demand elegance. No hacky fixes.
- Capture lessons after every correction.

---

## Architecture Decisions (locked)

| Concern         | Choice                  | Reason |
|-----------------|-------------------------|--------|
| Backend         | Ruby on Rails (API mode)| Productive, mature ecosystem, team familiarity |
| Frontend        | Next.js 14 (App Router) | SSR for SEO, React ecosystem, TypeScript |
| Mobile          | React Native (Expo)     | Shared knowledge with web frontend |
| Database        | PostgreSQL              | Full-text search, JSONB for metadata |
| Background Jobs | Sidekiq + Redis         | Audio processing, AI jobs |
| Media Storage   | Cloudflare R2           | Zero egress fees — critical for audio |
| CDN             | Cloudflare              | Free, fast, DDoS protection |
| Hosting         | Fly.io                  | Edge deployment, managed Postgres + Redis |
| Auth            | Devise + JWT (API)      | Rails standard, battle-tested |
| Payments        | Stripe                  | SaaS billing, subscription tiers |
| AI - Transcription | OpenAI Whisper       | Best-in-class audio → text |
| AI - Content    | Anthropic Claude API    | Show notes, summaries, chapters |

---

## Multi-Tenancy Design (SaaS from day one)
- `Organization` is the top-level tenant (a podcasting company or individual)
- `User` belongs to one or more Organizations (with roles: owner, admin, editor, viewer)
- `Podcast` belongs to Organization
- `Episode` belongs to Podcast
- All queries scoped to current_organization — never leak data across tenants
- Subdomain routing: `{slug}.freedompodcasting.com` for public podcast pages
- Custom domain support (Phase 3)

---

## Database Schema (Phase 1)

### organizations
- id, name, slug (unique), plan (free/starter/pro/agency), stripe_customer_id
- created_at, updated_at

### users
- id, email, password_digest, first_name, last_name
- created_at, updated_at

### memberships (join table)
- id, user_id, organization_id, role (owner/admin/editor/viewer)
- created_at, updated_at

### podcasts
- id, organization_id, title, description, author, email
- artwork_url, language, category, subcategory
- explicit (boolean), podcast_type (episodic/serial)
- slug (unique), custom_domain
- rss_token (for private feeds), published (boolean)
- created_at, updated_at

### episodes
- id, podcast_id, title, description (text), summary
- audio_url, audio_file_size, audio_duration_seconds, audio_content_type
- artwork_url, episode_number, season_number
- episode_type (full/trailer/bonus)
- explicit (boolean), published_at, status (draft/scheduled/published)
- guid (uuid, immutable — RSS requirement)
- transcript (text), show_notes (text)
- created_at, updated_at

### media_files
- id, organization_id, episode_id (nullable), filename, content_type
- file_size, r2_key, public_url, duration_seconds
- processing_status (pending/processing/ready/failed)
- created_at, updated_at

---

## Phase 1 — Foundation & RSS Feed [ ]
Goal: A working podcast host where you can upload an episode and get a valid RSS feed.

### Backend (Rails API)
- [x] 1.1 Rails new API app with PostgreSQL
- [x] 1.2 Gems: devise, jwt, pundit (auth/authz), aws-sdk-s3 (R2 compatible), sidekiq, rspec
- [x] 1.3 Database schema + migrations (above)
- [x] 1.4 Authentication: registration, login, JWT tokens
- [x] 1.5 Organizations + memberships (multi-tenancy)
- [x] 1.6 Podcasts CRUD API
- [x] 1.7 Episodes CRUD API
- [x] 1.8 Direct upload to R2 via presigned URLs (no file passes through Rails server)
- [x] 1.9 RSS feed generation (valid iTunes/Spotify/Google Podcasts spec)
- [x] 1.10 Sidekiq worker: extract audio duration/metadata after upload
- [x] 1.11 RSpec tests for RSS output (critical — invalid RSS breaks all directories)

### Frontend (Next.js)
- [x] 1.12 Next.js 14 app with TypeScript, Tailwind CSS
- [x] 1.13 Auth pages: login, register, forgot password
- [x] 1.14 Dashboard layout (sidebar nav, org switcher)
- [x] 1.15 Podcast management: create, edit, artwork upload
- [x] 1.16 Episode management: create, edit, audio upload (direct to R2)
- [x] 1.17 Audio upload with progress bar
- [x] 1.18 RSS feed URL display + copy button
- [x] 1.19 Public podcast page: `/{slug}` with episode list + player
- [x] 1.20 Embedded audio player component

### Infrastructure
- [x] 1.21 Dockerfile for Rails API
- [x] 1.22 fly.toml config (API + worker processes)
- [ ] 1.23 Cloudflare R2 bucket CORS policy (allow PUT from freedompodcasting.com + fly.dev origins)
- [x] 1.24 Environment variable management (fly secrets)
- [ ] 1.25 CI/CD with GitHub Actions → Fly.io deploy

---

## Phase 2 — Client Platform [ ]
Goal: Paying clients can log in, manage their show, and collaborate with your team.

- [x] 2.1 Invitation system (invite clients to their org)
- [x] 2.2 Role-based access control (useRole hook + backend require_manager!/require_editor! helpers)
- [ ] 2.3 Episode workflow: draft → review → approved → published
- [ ] 2.4 Comments/feedback on episodes (for producer ↔ client communication)
- [ ] 2.5 Analytics: download counts, geographic distribution
- [ ] 2.6 Stripe subscription billing (free/starter/pro/agency tiers)
- [ ] 2.7 Podcast website (public-facing, SEO optimized)
- [ ] 2.8 Custom domain support (CNAME → Cloudflare)

---

## Phase 3 — AI Production Tools [ ]
Goal: AI makes production faster and better.

- [ ] 3.1 Whisper transcription pipeline (Sidekiq job after upload)
- [ ] 3.2 Claude: auto-generate show notes from transcript
- [ ] 3.3 Claude: episode summary (short + long versions)
- [ ] 3.4 Claude: chapter markers with timestamps
- [ ] 3.5 Claude: SEO title suggestions
- [ ] 3.6 Claude: social media clip suggestions
- [ ] 3.7 Transcript editor (correct errors, search within transcript)
- [ ] 3.8 Audio waveform visualization with chapter markers

---

## Phase 4 — Mobile App [ ]
Goal: Producers and clients can manage shows from mobile.

- [ ] 4.1 Expo React Native app setup
- [ ] 4.2 Auth flow
- [ ] 4.3 Dashboard + episode list
- [ ] 4.4 Episode upload from mobile (record or file picker)
- [ ] 4.5 AI review on mobile
- [ ] 4.6 Push notifications (episode published, review requested)

---

## Review
*(filled in after completion of each phase)*

---
