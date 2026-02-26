class ProcessAudioJob < ApplicationJob
  queue_as :audio_processing
  retry_on StandardError, wait: :polynomially_longer, attempts: 3

  def perform(media_file_id)
    media_file = MediaFile.find(media_file_id)
    return if media_file.processing_status == "ready"

    # Check if ffmpeg is available (not installed in dev Docker image)
    unless system("which ffmpeg > /dev/null 2>&1")
      Rails.logger.info "ffmpeg not available — marking media file ready without metadata"
      media_file.update!(processing_status: "ready")
      return
    end

    media_file.update!(processing_status: "processing")

    Tempfile.create([File.basename(media_file.r2_key, ".*"), File.extname(media_file.r2_key)]) do |tmp|
      download_file(media_file.public_url, tmp)
      movie    = FFMPEG::Movie.new(tmp.path)
      duration = movie.duration.to_i

      media_file.update!(
        duration_seconds: duration,
        file_size:        tmp.size,
        processing_status: "ready",
        metadata: { bitrate: movie.bitrate, audio_codec: movie.audio_codec }
      )

      media_file.episode&.update!(
        audio_duration_seconds: duration,
        audio_file_size:        tmp.size
      )
    end
  rescue => e
    media_file&.update!(processing_status: "failed")
    raise e
  end

  private

  def download_file(url, tmp)
    uri = URI.parse(url)
    Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == "https") do |http|
      http.request_get(uri.request_uri) { |r| r.read_body { |chunk| tmp.write(chunk) } }
    end
    tmp.flush
    tmp.rewind
  end
end
