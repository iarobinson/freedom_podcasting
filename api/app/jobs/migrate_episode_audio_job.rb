class MigrateEpisodeAudioJob < ApplicationJob
  queue_as :default
  retry_on StandardError, wait: :polynomially_longer, attempts: 3

  # Raised for 4xx responses — audio is gone, don't retry
  AudioUnavailableError = Class.new(StandardError)

  def perform(episode_id, source_url, content_type, podcast_import_id)
    episode = Episode.find(episode_id)
    org     = episode.podcast.organization

    ext = File.extname(URI.parse(source_url.split("?").first).path).downcase.presence || ".mp3"

    Tempfile.create(["episode-audio", ext]) do |tmp|
      download_file(source_url, tmp)

      r2_key = "organizations/#{org.id}/audio/#{SecureRandom.uuid}#{ext}"
      mf = org.media_files.create!(
        filename:          File.basename(r2_key),
        content_type:      content_type,
        r2_key:            r2_key,
        episode_id:        episode.id,
        file_size:         tmp.size,
        processing_status: "processing"
      )

      File.open(tmp.path, "rb") do |f|
        StorageService.new.upload_data(key: r2_key, data: f, content_type: content_type)
      end

      episode.update!(
        audio_url:          mf.public_url,
        audio_file_size:    tmp.size,
        audio_content_type: content_type,
        audio_filename:     File.basename(r2_key)
      )

      ProcessAudioJob.perform_later(mf.id)
    end

    increment_imported(podcast_import_id)

  rescue AudioUnavailableError => e
    # 4xx from source — audio is gone, mark episode as draft and skip
    Rails.logger.warn "MigrateEpisodeAudioJob: audio unavailable for episode #{episode_id} — #{e.message}"
    episode&.update(status: "draft", audio_url: nil, audio_file_size: nil, audio_content_type: nil)
    increment_skipped(podcast_import_id)
    # No re-raise: this is expected, not retriable

  rescue => e
    # Unexpected error (network, 5xx, etc.) — count it and let Sidekiq retry
    Rails.logger.error "MigrateEpisodeAudioJob failed for episode #{episode_id}: #{e.message}"
    increment_imported(podcast_import_id)  # stall-safe: import never hangs
    raise
  end

  private

  def increment_imported(podcast_import_id)
    return unless podcast_import_id
    PodcastImport.where(id: podcast_import_id)
                 .update_all("imported_episodes = imported_episodes + 1")
    check_completion(podcast_import_id)
  end

  def increment_skipped(podcast_import_id)
    return unless podcast_import_id
    PodcastImport.where(id: podcast_import_id)
                 .update_all("skipped_episodes = skipped_episodes + 1")
    check_completion(podcast_import_id)
  end

  def check_completion(podcast_import_id)
    imp = PodcastImport.find_by(id: podcast_import_id)
    return unless imp
    imp.update!(status: "done") if (imp.imported_episodes + imp.skipped_episodes) >= imp.total_episodes
  end

  def download_file(url, tmp)
    tmp.binmode
    uri = URI.parse(url)
    redirects = 0
    loop do
      raise "Too many redirects fetching audio" if redirects > 5
      done = false
      Net::HTTP.start(uri.host, uri.port,
                      use_ssl: uri.scheme == "https",
                      open_timeout: 15,
                      read_timeout: 300) do |http|
        http.request_get(uri.request_uri, "User-Agent" => "FreedomPodcasting/1.0") do |r|
          case r.code.to_i
          when 200..299
            r.read_body { |chunk| tmp.write(chunk) }
            done = true
          when 301, 302, 303, 307, 308
            uri = URI.parse(r["Location"])
            redirects += 1
          when 400..499
            raise AudioUnavailableError, "HTTP #{r.code} downloading audio"
          else
            raise "HTTP #{r.code} downloading audio"  # 5xx etc — retriable
          end
        end
      end
      break if done
    end
    tmp.flush
    tmp.rewind
  end
end
