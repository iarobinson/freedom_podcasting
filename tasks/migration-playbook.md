# Client Migration Playbook

Internal process for migrating a podcast from an existing host (Buzzsprout, Libsyn, Anchor, etc.) to FreedomPodcasting.

---

## Prerequisites

- Staff access to `app.freedompodcasting.com/dashboard/admin`
- Client's current RSS feed URL
- Client's consent to migrate (confirm they want to cancel their old host)

---

## Step 1 — Provision the Client Org

1. Go to `/dashboard/admin` → **New Client Org**
2. Fill in:
   - **Organization Name** — client's show/company name
   - **Slug** — auto-derived; adjust if needed (must be URL-safe)
   - **Plan** — typically `starter` or `pro` depending on engagement
   - **RSS Feed URL** — paste the client's current feed URL
3. Click **Create Organization**
4. RSS import starts in the background (Sidekiq). It imports all episodes with their existing audio URLs pointing to the old CDN.

---

## Step 2 — Verify the Import

Switch into the client's org via the **Switch client org** dropdown.

Check:
- [ ] All episodes imported (count matches old host)
- [ ] Episode titles, descriptions, publish dates are correct
- [ ] Artwork imported on the podcast
- [ ] RSS feed renders at `https://api.freedompodcasting.com/feeds/{rss_token}` — validate at [castfeedvalidator.com](https://www.castfeedvalidator.com)

If episodes are missing or out of order: check Sidekiq logs (`flyctl logs --app freedom-podcasting-api`) for `ImportRssFeedJob` errors. Re-run if needed via Rails console:

```ruby
ImportRssFeedJob.perform_later(PodcastImport.last.id)
```

---

## Step 3 — Verify Audio Migration to R2

Audio migration is **automatic**. `ImportRssFeedJob` enqueues `MigrateEpisodeAudioJob` for every episode — it downloads each file from the old host and re-uploads it to R2. By the time the import status shows "done", all audio is already on the FreedomPodcasting CDN and `audio_url` on each episode points to R2.

Check:
- [ ] Import status is "done" (visible in the admin page or via Rails console: `PodcastImport.last`)
- [ ] Spot-check a few episode `audio_url` values — they should start with `https://` pointing to your R2 public URL, not the old host
- [ ] Any episodes with unavailable audio on the old host will be set to `draft` automatically (check for unexpected drafts)

If audio migration is still in progress (import not yet "done"), wait for Sidekiq to finish before cancelling the old host.

---

## Step 4 — Update the Client's Feed URL in Directories

Once the FreedomPodcasting RSS feed validates correctly, update the feed URL in each directory:

| Directory | Where to update |
|-----------|-----------------|
| Apple Podcasts | [podcastsconnect.apple.com](https://podcastsconnect.apple.com) → Your show → Settings → RSS Feed |
| Spotify | [podcasters.spotify.com](https://podcasters.spotify.com) → Podcast settings → RSS |
| Amazon Music | [music.amazon.com/podcasts/dashboard](https://music.amazon.com/podcasts/dashboard) |
| Google Podcasts | Deprecated — not needed |

New feed URL format: `https://api.freedompodcasting.com/feeds/{rss_token}`

The `rss_token` is visible on the podcast edit page in the dashboard.

> Allow 24–72 hours for directories to re-crawl the new feed.

---

## Step 5 — Invite the Client (optional)

If the client wants their own login:

1. Go to `/dashboard/settings/members` (while in the client's org)
2. **Invite** the client with role `viewer` (read-only) or `editor` (can manage episodes)
3. They'll receive an invitation email

---

## Step 6 — Verify Everything Live

- [ ] New episodes publish correctly (create a test draft, publish, check RSS)
- [ ] Audio playback works from the FP CDN URL (R2)
- [ ] Directories are showing updated episodes within 72 hours
- [ ] Client can log in (if invited) and see their show

---

## Step 7 — Cancel the Old Host

Only cancel after:
- [ ] Import status is "done" (all audio migrated to R2)
- [ ] Directories have updated to new feed URL
- [ ] Client has confirmed they're happy

Give the client a heads-up before cancelling so there are no surprises.

---

## Troubleshooting

| Issue | Resolution |
|-------|------------|
| RSS import didn't start | Check Sidekiq dashboard at `/sidekiq` (requires VPN/SSH). Re-enqueue `ImportRssFeedJob` |
| Episodes have wrong order | Check `published_at` on imported episodes; sort in podcast RSS controller is by `published_at DESC` |
| Feed fails castfeedvalidator | Check for missing required fields: title, description, author, email, language |
| Old host audio URLs broken | Client cancelled too early — re-upload audio to R2 ASAP |
| Directory still showing old feed | Ping Apple/Spotify support with the old + new URL. Usually resolves in 72h |
