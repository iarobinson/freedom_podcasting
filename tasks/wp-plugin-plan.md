# WordPress Plugin — Implementation Plan

## Architecture Decisions

**Feed:** Served by WordPress (`/?feed=podcast`). Audio hosted on FP R2. Client's WordPress site is the canonical feed URL.

**Auth:** OAuth-style one-click connect flow. User clicks "Connect to FreedomPodcasting" → redirected to `app.freedompodcasting.com/connect/wordpress?callback=...` → logs in → clicks Authorize → PAT created → redirected back with `?fp_token=`. Token stored in wp_options (autoload: false). No copy/paste.

**Plugin type:** Operates on standard `post` objects (not a CPT). Meta box added to posts. Feed excludes posts without `_fp_audio_url`.

---

## Implementation Order (strict — each phase depends on the last)

### Phase 1 — Rails: PAT Infrastructure (do first)
1. Migration: `personal_access_tokens` table (user_id, organization_id, token_digest, token_prefix, name, scopes, last_used_at, expires_at, revoked_at)
2. `PersonalAccessToken` model — `generate_for(user:, organization:, name:)` returns `[record, plaintext]`; `authenticate(raw_token)` — prefix lookup + BCrypt compare
3. `PersonalAccessTokenAuthenticatable` concern — `authenticate_via_pat!` action
4. `POST /api/v1/wordpress/tokens` — JWT auth, creates PAT, returns plaintext once
5. `GET /api/v1/wordpress/tokens` — list active PATs (no plaintext)
6. `DELETE /api/v1/wordpress/tokens/:id` — revoke
7. RSpec request specs, deploy

### Phase 2 — Rails: WordPress API Endpoints
1. `Api::V1::Wordpress::BaseController < ActionController::API` — PAT auth, no Devise
2. `GET /api/v1/wordpress/me` → user + org + podcast list
3. `POST /api/v1/wordpress/podcasts` → create/update podcast, return `fp_podcast_id`
4. `POST /api/v1/wordpress/podcasts/:id/uploads/presign` → R2 presigned URL
5. `POST /api/v1/wordpress/podcasts/:id/uploads/complete` → notify, enqueue ProcessAudioJob (no AI)
6. CORS: allow any HTTPS origin for `/api/v1/wordpress/*`
7. R2 bucket: add CORS rule allowing PUT from `*`
8. RSpec + deploy

### Phase 3 — Next.js: Connect Flow UI
1. `/connect/wordpress` page
2. Unauthenticated: show login, then redirect back with callback preserved
3. Authenticated: show org selector (if multiple orgs) + "Authorize" / "Cancel" screen
4. On Authorize: POST to `/api/v1/wordpress/tokens` with user JWT, get plaintext token
5. Redirect to `callback_url + &fp_token=xxx&fp_org=slug`
6. Validate callback URL starts with `https://` before redirect

### Phase 4 — WP Plugin: Core + Feed
1. Plugin scaffold (see file structure below)
2. Show settings page — `wp_options`, Settings API, proper sanitization
3. RSS feed — register `/?feed=podcast`, flush rewrite rules on activation
4. Validate feed at castfeedvalidator.com and feedvalidator.org
5. Test import into Apple Podcasts Connect

### Phase 5 — WP Plugin: FP Connect
1. `class-fp-connect-handler.php` — intercepts callback on `admin_init`, verifies nonce, stores token, redirects to clean URL
2. `class-fp-api-client.php` — all methods use `wp_remote_request()`
3. Connect section in settings page — button, connected state, disconnect
4. On connect: call `/me`, store org_slug, org_name

### Phase 6 — WP Plugin: Upload Widget
1. `episode-metabox.js` — file picker → wp_ajax `fp_presign_upload` → PUT to R2 → wp_ajax `fp_complete_upload` → populate fields
2. AJAX handlers in PHP — `check_ajax_referer()` + `current_user_can('edit_posts')`
3. Test against staging (requires R2 CORS rule from Phase 2)

### Phase 7 — Submission
1. Run Plugin Check plugin — fix all errors + warnings
2. Write complete readme.txt (see template below)
3. Test on WP 6.0+, PHP 8.0, PHP 8.3
4. Submit to wordpress.org

---

## File Structure (new repo: freedom-podcasting-wp-plugin)

```
freedom-podcasting/
├── freedom-podcasting.php           # Main file — plugin headers + bootstrap
├── readme.txt                       # wordpress.org listing
├── uninstall.php                    # Deletes all fp_ options + _fp_ post_meta
├── includes/
│   ├── class-fp-plugin.php          # Singleton loader
│   ├── class-fp-activator.php       # flush_rewrite_rules on activation
│   ├── class-fp-deactivator.php
│   ├── admin/
│   │   ├── class-fp-admin.php
│   │   ├── class-fp-settings-page.php
│   │   ├── class-fp-episode-metabox.php
│   │   └── class-fp-connect-handler.php
│   ├── feed/
│   │   └── class-fp-feed.php
│   ├── api/
│   │   └── class-fp-api-client.php
│   └── shortcodes/
│       └── class-fp-player-shortcode.php
├── assets/
│   ├── css/admin.css
│   ├── css/player.css
│   └── js/
│       ├── admin-settings.js
│       ├── episode-metabox.js
│       └── player.js
└── templates/
    └── audio-player.php
```

---

## wp_options Keys

| Key | Contents |
|-----|----------|
| `fp_show_title` | Podcast title |
| `fp_show_description` | Description |
| `fp_show_author` | Author name |
| `fp_show_email` | Author email |
| `fp_show_language` | e.g. `en` |
| `fp_show_category` | iTunes category (dropdown) |
| `fp_show_explicit` | `1` or `0` |
| `fp_show_artwork_url` | Cover art URL |
| `fp_show_website_url` | Website |
| `fp_show_copyright` | Copyright line |
| `fp_connected` | `1` if PAT stored |
| `fp_access_token` | PAT plaintext (autoload: false) |
| `fp_org_slug` | Connected org slug |
| `fp_org_name` | Connected org display name |
| `fp_podcast_id` | FP podcast DB ID after first sync |

## post_meta Keys

| Key | Contents |
|-----|----------|
| `_fp_audio_url` | Audio file URL |
| `_fp_audio_duration` | Seconds |
| `_fp_audio_file_size` | Bytes |
| `_fp_audio_content_type` | MIME type |
| `_fp_episode_number` | int |
| `_fp_season_number` | int |
| `_fp_episode_type` | `full`, `trailer`, `bonus` |
| `_fp_explicit` | `1` or `0` |
| `_fp_fp_media_file_id` | FP MediaFile ID |

---

## RSS Feed Required Tags

### Channel level
- `<title>`, `<link>`, `<description>`, `<language>`, `<copyright>`
- `<atom:link rel="self" href="{feed_url}" type="application/rss+xml"/>`
- `<itunes:author>`, `<itunes:summary>`, `<itunes:explicit>` (must be `true`/`false`)
- `<itunes:type>episodic</itunes:type>`
- `<itunes:image href="{artwork_url}"/>` (must be 1400–3000px JPEG/PNG)
- `<itunes:category text="{category}"/>` (use Apple's exact taxonomy)
- `<itunes:owner><itunes:name>...</itunes:name><itunes:email>...</itunes:email></itunes:owner>`
- `<image><url>...</url><title>...</title><link>...</link></image>`
- `<podcast:locked>no</podcast:locked>`

### Item level (per episode)
- `<title>`, `<description>` (CDATA), `<content:encoded>` (CDATA), `<guid isPermaLink="false">`
- `<pubDate>` (RFC 2822, must include timezone: `+0000`)
- `<enclosure url="{audio_url}" length="{bytes}" type="{mime}"/>` (length required even if 0)
- `<itunes:title>`, `<itunes:author>`, `<itunes:explicit>`, `<itunes:duration>` (seconds)
- `<itunes:episodeType>full|trailer|bonus</itunes:episodeType>`
- `<itunes:episode>{number}</itunes:episode>` (if set)
- `<itunes:season>{number}</itunes:season>` (if set)
- `<itunes:summary>` (max 4000 chars)
- `<itunes:image href="{episode_artwork or show_artwork}"/>`

### Common rejection causes
- `<itunes:explicit>` uses `yes`/`no` instead of `true`/`false`
- `<enclosure>` missing `length`
- `<guid>` changes when post is edited (must be immutable)
- Artwork URL returns 404
- `<pubDate>` missing timezone
- Channel `<description>` empty or identical to `<title>`
- `<atom:link rel="self">` missing

---

## Security Rules (wordpress.org review will check these)

- Every `$_GET`/`$_POST` value: `sanitize_*()` before use
- Every HTML output: `esc_html()`, `esc_attr()`, `esc_url()`, `esc_xml()`
- Every form: `wp_nonce_field()` + `wp_verify_nonce()`
- Every AJAX handler: `check_ajax_referer()` + `current_user_can()`
- No `curl_*` — use `wp_remote_request()`
- No raw SQL — use `get_option()`, `update_post_meta()`, `$wpdb->prepare()` if needed
- `uninstall.php`: delete all `fp_*` options and `_fp_*` post_meta
- External service disclosure in readme.txt Description section

---

## readme.txt Template

```
=== Freedom Podcasting ===
Contributors: freedompodcasting
Tags: podcast, rss, audio, feed, itunes
Requires at least: 6.0
Tested up to: 6.7
Requires PHP: 8.0
Stable tag: 1.0.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Publish a podcast RSS feed from WordPress. Optional audio hosting via FreedomPodcasting.

== Description ==

Freedom Podcasting is a free WordPress plugin that generates a valid iTunes and
Spotify-compatible podcast RSS feed from your WordPress site.

**Free features (no account required):**
* Valid podcast RSS feed at yoursite.com/feed/podcast
* Podcast show settings: title, author, artwork, category, language
* Episode metadata on posts: episode number, season, type, explicit flag
* [fp_player] shortcode and Gutenberg block for embedding audio
* Upsell-free core functionality

**With a FreedomPodcasting account (optional):**
* Upload audio files directly from WordPress — no separate hosting needed
* Files stored on Cloudflare R2 CDN for fast global delivery
* One-click connection — no API keys to copy/paste

**External services:** When you connect a FreedomPodcasting account, this plugin
communicates with api.freedompodcasting.com to upload audio and sync podcast
metadata. No data is sent to external services unless you explicitly connect an
account. See the FreedomPodcasting privacy policy at freedompodcasting.com/privacy.

== Installation ==
1. Upload the plugin to /wp-content/plugins/freedom-podcasting/ or install via the Plugins screen
2. Activate the plugin
3. Go to Settings > Freedom Podcasting to configure your show

== Frequently Asked Questions ==

= Do I need a FreedomPodcasting account? =
No. The plugin generates a valid RSS feed and embeds audio players using any audio URL you provide.

= Where is my RSS feed? =
At yoursite.com/feed/podcast (or yoursite.com/?feed=podcast if you don't use pretty permalinks).

= Can I use audio hosted anywhere? =
Yes. Enter any publicly accessible audio URL in the episode media field.

== Screenshots ==
1. Show settings page
2. Episode meta box with media upload
3. FP Connect section
4. Example RSS feed

== Changelog ==
= 1.0.0 =
* Initial release

== Upgrade Notice ==
= 1.0.0 =
Initial release.
```
