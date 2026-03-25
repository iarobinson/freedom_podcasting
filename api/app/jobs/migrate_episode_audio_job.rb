class MigrateEpisodeAudioJob < ApplicationJob
  queue_as :default
  retry_on StandardError, wait: :polynomially_longer, attempts: 3

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
  rescue => e
    Rails.logger.error "MigrateEpisodeAudioJob failed for episode #{episode_id}: #{e.message}"
  ensure
    # Atomic increment — always runs so a failed episode never stalls the import
    PodcastImport.where(id: podcast_import_id)
                 .update_all("imported_episodes = imported_episodes + 1")
    imp = PodcastImport.find_by(id: podcast_import_id)
    imp&.update!(status: "done") if imp && imp.imported_episodes >= imp.total_episodes
  end

  private

  def download_file(url, tmp)
    tmp.binmode
    uri = URI.parse(url)
    Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == "https",
                    open_timeout: 15, read_timeout: 300) do |http|
      http.request_get(uri.request_uri, "User-Agent" => "FreedomPodcasting/1.0") do |r|
        r.read_body { |chunk| tmp.write(chunk) }
      end
    end
    tmp.flush
    tmp.rewind
  end
end
