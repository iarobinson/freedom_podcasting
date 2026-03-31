# Lessons Learned — FreedomPodcasting

## Workflow Orchestration (user-defined rules)
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan — don't keep pushing
- Use subagents liberally to keep main context clean; offload research/exploration
- After ANY user correction: update this file with the pattern
- Never mark a task complete without proving it works — check logs, demonstrate correctness
- For non-trivial changes: ask "is there a more elegant way?" before presenting
- When given a bug report: just fix it — point at logs, errors, resolve them autonomously

---

## Bug Patterns

### 1. Missing `has_many` when creating a new model
**Mistake:** Created `PodcastImport` model + migration + controller but forgot to add
`has_many :podcast_imports, dependent: :destroy` to `Organization`.
Result: `NoMethodError: undefined method 'podcast_imports'` at runtime.

**Rule:** When creating a new model that belongs_to an existing model, ALWAYS add the
reciprocal `has_many` to the parent model in the same session. Checklist:
  - [ ] Migration created
  - [ ] New model `belongs_to :parent`
  - [ ] Parent model `has_many :new_model, dependent: :destroy`
  - [ ] Controller scopes via `current_organization.new_models`

---

### 2. Creating records with status that violates conditional validations
**Mistake:** `ImportRssFeedJob` created all episodes as `status: "published"`, but the
`Episode` model validates `audio_url: presence: true, if: :published?`. Blog-style RSS
feeds don't have `<enclosure>` tags, so `audio_url` was nil → `RecordInvalid` → job crash.

**Rule:** Before calling `create!` with a status, read the model's conditional validations.
If a field is required conditionally on status, ensure the status is consistent with the
data you have. When in doubt, default to `"draft"` and only use `"published"` if all
required fields are present.

---

### 3. Deploy without smoke-testing the critical path
**Mistake:** Shipped the RSS import pipeline without testing an actual import. Two bugs
(missing association, wrong episode status) only surfaced when the user tried it.

**Rule:** Before marking a new feature "deployed and done":
  1. Check logs for any errors during the first real use
  2. For background jobs: verify job enqueued, ran, and produced expected DB state
  3. For new API endpoints: confirm the endpoint is reachable and returns expected shape

---

### 4. Frontend error handling masks root cause
**Mistake:** The catch block showed "Could not start the import. Check the URL and try again."
— a generic message that gave no diagnostic info. The actual error was a 500 from the API
due to missing `has_many`. The generic toast made it impossible to debug without logs.

**Rule:** In development/staging, include the raw error message in toast bodies.
In production at minimum log `error.response?.status` + `error.response?.data` to console
so the browser devtools show the actual server error.

---

### 5. Using user-supplied identifiers (like GUID) in URL paths
**Mistake:** RSS feed enclosure URL used `episode.guid` in the URL path. GUIDs from
imported WordPress feeds are full URLs (e.g. `https://ianrobinson.net/?p=6870`), making
the enclosure URL unroutable: `.../episodes/https://ianrobinson.net/?p=6870`.

**Rule:** Never embed arbitrary user-supplied strings in URL paths. Use internal stable
IDs (`episode.id`) for routing. Keep GUIDs in their proper place (the `<guid>` XML
element) and don't reuse them as URL segments.

---

### 7. `return` inside `ensure` suppresses re-raised exceptions (Ruby gotcha)
**Mistake:** `MigrateEpisodeAudioJob` had `rescue => e ... raise` but the `ensure` block
began with `return unless podcast_import_id`. When `podcast_import_id` is nil, the `return`
statement inside `ensure` silently swallowed the re-raised exception. Sidekiq saw the job
as "processed successfully" and never retried. All 78 episodes stayed at 0 bytes with no
error visible anywhere.

**Rule:** Never use `return` inside an `ensure` block if the method may re-raise exceptions.
Replace `return unless x` with `if x ... end`. The pattern:
  ```ruby
  # BAD — return suppresses pending exceptions
  ensure
    return unless podcast_import_id
    do_counter_increment(podcast_import_id)
  end
  # GOOD — if guard doesn't suppress exceptions
  ensure
    if podcast_import_id
      do_counter_increment(podcast_import_id)
    end
  end
  ```

---

### 8. Don't swallow exceptions in background jobs
**Mistake:** `rescue => e` logged the error but didn't `raise`. Sidekiq counted all failed
jobs as successes. Retry mechanism never fired. Only discovered when manually querying DB
and finding all file sizes still 0.

**Rule:** In Sidekiq jobs, `rescue => e` should ALWAYS re-raise (or not exist at all).
If you want to log before re-raising:
  ```ruby
  rescue => e
    Rails.logger.error "#{self.class} failed: #{e.message}"
    raise  # Sidekiq needs to see this to retry
  ```
The `retry_on StandardError` config is useless if exceptions are swallowed.

---

### 9. Original audio source may be gone — RSS re-import can't recover 404s
**Observation:** Coffer podcast was hosted on SoundCloud. By the time we attempted to
re-migrate audio, all 78 SoundCloud stream URLs returned 404. The audio data is
permanently lost.

**Implication:** RSS import can only migrate audio that still exists at the source URL.
Old podcasts with expired CDN/SoundCloud links cannot be recovered via RSS re-import.
Users must upload original MP3 files manually if the source is gone.

---

### 6. Missing `tmp.binmode` in download helpers
**Mistake:** `ProcessArtworkJob#download_file` wrote binary image data to a Tempfile
opened in text mode. PNG files start with `\x89` which is invalid UTF-8, causing
`Encoding::UndefinedConversionError` and the job failing after multiple retries.

**Rule:** Any `download_file` helper that writes binary data (images, audio, any binary
file) MUST call `tmp.binmode` before writing. Pattern:
  ```ruby
  def download_file(url, tmp)
    tmp.binmode   # ← always first
    ...
  end
  ```
