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
- [x] 1.23 Cloudflare R2 bucket CORS policy (allow PUT from freedompodcasting.com + fly.dev origins)
- [x] 1.24 Environment variable management (fly secrets)
- [x] 1.25 CI/CD with GitHub Actions → Fly.io deploy

---

## Phase 2 — Client Platform [x]
Goal: Paying clients can log in, manage their show, and collaborate with your team.

- [x] 2.1 Invitation system (invite clients to their org)
- [x] 2.2 Role-based access control (useRole hook + backend require_manager!/require_editor! helpers)
- [x] 2.3 Episode workflow: draft → review → approved → published
- [ ] 2.4 Comments/feedback on episodes (for producer ↔ client communication) — deferred, use Slack
- [x] 2.5 Analytics: download counts, geographic distribution
- [x] 2.6 Stripe subscription billing (free/starter/pro/agency tiers)
- [x] 2.7 Podcast website (public-facing, SEO optimized) — org-scoped URLs (/p/{org}/{podcast})
- [ ] 2.8 Custom domain support (CNAME → Cloudflare) — deferred
- [x] 2.9 Podcast directory links (Apple Podcasts, Spotify, Amazon Music) on edit + public pages
- [x] 2.10 RSS feed token-based URLs (/feeds/{rss_token}) — opaque, stable, no org name exposed; org-scoped URLs 301 redirect to canonical token URL
- [x] 2.11 AI features paywall — transcription/show notes gated to paid plans (402 for free)
- [x] 2.12 Per-episode AI purchase for free tier — Stripe Checkout one-time payment ($0.50/min), ai_purchased_at column, unlocks transcription + show notes for that episode
- [x] 2.13 SEO blog + content marketing — MDX blog at /blog, 5 keyword-targeted articles, sitemap.xml, robots.txt, Article/ItemList JSON-LD schema, Google Search Console verified
- [x] 2.14 Admin signup notification email — AdminMailer delivers to ian@freedompodcasting.com on new user registration

---

## Phase 3 — AI Production Tools [~]
Goal: AI makes production faster and better.

- [x] 3.1 Whisper transcription pipeline (Sidekiq job, 16kHz mono transcode, timestamped output)
- [x] 3.2 Claude: auto-generate show notes with chapter markers from transcript
- [x] 3.3 Claude: episode summary (one-sentence for podcast apps)
- [x] 3.4 Claude: chapter markers with real timestamps from Whisper segments
- [x] 3.5 Audio-first episode creation — upload audio → AI auto-fills title/description/summary
- [x] 3.6 AI processing status indicator (step-by-step progress panel with polling)
- [x] 3.7 Claude: SEO title suggestions (lightbulb button near title → 5 clickable pill suggestions)
- [x] 3.8 Claude: social media clip suggestions (Scissors button → timestamp/quote/hook cards with copy)
- [x] 3.9 Transcript editor (editable textarea, search/highlight, Save button on change)
- [x] 3.10 Audio waveform visualization with chapter markers (pre-computed peaks via ffmpeg, SVG bars, chapter lines on both edit + public pages)
- [ ] 3.11 Drop in audio advertisement injection to add to mp3s.

---

## Phase 3.5 — Production Hardening [x]
Goal: Application is reliable and safe for real users before public launch.

- [x] H.1 Fix login infinite spinner — add try/catch to login/fetchMe in store.ts so isLoading always resets on error; show user-facing error message
- [x] H.2 Frontend error boundaries — error.tsx, global-error.tsx, not-found.tsx created; missing onError handlers fixed; API logging + 15s timeout added; errorUtils.ts DRYs error extraction
- [x] H.3 Verify R2 CORS — confirmed working: PUT preflight from app.freedompodcasting.com returns correct Access-Control-Allow-Origin header
- [x] H.4 Add web unit tests — Vitest + RTL; 9 tests: LoginForm (401/500/success/reset-banner) + AudioUploader (MIME rejection, size rejection, presign params, progress, success); runs in CI before build
- [x] H.5 OOM hardening — concurrency reduced to 1; worker downsized then bumped to 1gb; restart policy always; scaled to 1 worker; deleted orphan DB cluster (~$40/mo saved)
- [x] H.6 CI deploy visibility — post-deploy health check polls live /health endpoint (24x at 5s) after each detached deploy; CI fails if app doesn't come up within 120s
- [x] H.7 Email verification on registration — Devise :confirmable with non-blocking flow; custom UserMailer.deliver_later; unverified banner in dashboard layout; resend endpoint; verify-email landing page
- [x] H.8 Password reset flow — verified in production: reset email delivers via Resend, token link works, password updates, redirects to /auth/login?reset=1

---

## Phase 3.6 — WordPress Plugin [ ]
Goal: Free WordPress podcast plugin on wordpress.org that drives FreedomPodcasting hosting adoption.
Separate repo: `freedom-podcasting-wp-plugin`. Plan in tasks/wp-plugin-plan.md.

### Part 1 — FP API changes (Rails, must be done first)
- [x] W.1 PersonalAccessToken model + migration — long-lived tokens, hashed with BCrypt, prefix-indexed for fast lookup; format `fp_pat_<32 random chars>`
- [x] W.2 PAT auth concern + WordPress API namespace — `PersonalAccessTokenAuthenticatable` concern; BaseController, MeController, PodcastsController, UploadsController; 35 specs passing
- [x] W.3 Token management endpoints — `POST /api/v1/wordpress/organizations/:slug/tokens` (create, JWT auth), `GET` (list), `DELETE /:id` (revoke); 13 specs
- [x] W.4 CORS update — any HTTPS origin allowed for `/api/v1/wordpress/*`; R2 bucket PUT from `*` already permitted

### Part 2 — FP Connect UI (Next.js web app)
- [x] W.5 `/connect/wordpress` page — login → org selector → PAT create → redirect back with `?fp_token=`; HTTPS callback_url validation; `wordpressTokensApi` in api.ts

### Part 3 — WordPress Plugin (new repo: freedom-podcasting-wp-plugin)
- [x] W.6 Plugin scaffold — OOP singleton, GPL-2.0, activator/deactivator, translation-ready; all 18 files committed
- [x] W.7 Show settings page — Settings API, all fp_show_* options, sanitize callbacks, iTunes category dropdown
- [x] W.8 RSS feed — `/?feed=podcast`; full iTunes/Podcast Index spec; atom:link self, content:encoded, pubDate +0000, guid isPermaLink=false
- [x] W.9 Episode meta box — Audio URL, Duration, File Size, Content Type, Episode Number, Season, Type, Explicit; nonce-protected save
- [x] W.10 [fp_player] shortcode — HTML5 audio player; CSS only loaded when shortcode is present
- [x] W.11 FP Connect section — OAuth-style redirect to /connect/wordpress; nonce in callback URL; disconnect form
- [x] W.12 Upload widget — presign → XHR PUT to R2 with progress bar → complete → auto-populates Audio URL + Duration fields
- [x] W.13 uninstall.php — deletes all fp_* options and _fp_* post meta via $wpdb->prepare()
- [ ] W.14 Manual QA — install on real WP site, validate feed at castfeedvalidator.com, test connect flow end-to-end, test upload
- [ ] W.15 wordpress.org submission — Plugin Check: 0 errors/warnings; readme.txt complete; external service disclosure

---

## Phase 5 — User Acquisition & Growth [ ]
Goal: Get the first paying clients via two parallel tracks.

### Track A — Agency Migration (internal team, existing clients)
Move existing podcast production clients from other hosts to FreedomPodcasting.
Team of 4, each needing cross-org admin access to multiple client shows.

- [x] A.1 Agency admin layer — is_staff boolean + staff_role on User; virtual Membership for staff bypasses per-org invitations; billing locked to real DB owner rows only
- [x] A.2 Tiered team permissions — staff_role: admin|editor mirrors org roles; useRole() isStaff flag; Admin nav item + StaffOrgSwitcher in sidebar
- [x] A.3 Client org provisioning flow — /dashboard/admin page: searchable paginated org list, new org form (name/slug/plan/optional RSS import)
- [x] A.4 Uptime monitoring — UptimeRobot free tier; monitors for API /health, web app, and RSS feed; email alerts configured
- [x] A.5 Migration playbook — documented internal process: RSS import → audio migration check → publish verification → client invite → old host cancel (tasks/migration-playbook.md)
- [x] A.6 Feed Comparator tool — /tools/feed-comparator; LCS diff, semantic GUID/title comparison, GitHub-style diff viewer; "These are the same feeds" for identical feeds

### Track B — Self-Serve / Organic Growth (new podcasters)
Attract and convert podcasters who find the site via Google, blogs, AI recommendations.

- [x] B.1 Homepage conversion — 8-section redesign: hero, distribution bar, 6-card features (AI front-and-center), switcher section (Buzzsprout/Libsyn/Anchor), pricing with AI callouts, CTA banner, 3-column footer; OS-aware light/dark mode via semantic CSS variables; PublicNav + PublicFooter shared components
- [x] B.2 Onboarding flow — post-registration first-run: guided prompt to create first podcast + links to Apple/Spotify submission guides
- [x] B.3 Welcome email — sent on registration; brief "here's what to do next" with 3 steps
- [x] B.4 "Podcast is live" email — triggered on org's first ever published episode; sent to owner with RSS URL + Apple Podcasts + Spotify submission links
- [ ] B.5 Paid ad landing pages — dedicated pages for specific offers/audiences (e.g. "switching from Buzzsprout", "new podcast starter kit"); separate from homepage so ad ROI is measurable

---

## Phase 6 — Mobile App [ ]
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

## Known Gaps (not worth building yet)

| Gap | Reason deferred |
|-----|----------------|
| R2 orphaned file cleanup on podcast/episode delete | R2 storage is $0.015/GB — negligible cost at current scale. DB rows are cleaned up correctly via `dependent: :destroy`. Revisit if storage costs become meaningful. |
