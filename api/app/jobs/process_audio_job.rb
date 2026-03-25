class ProcessAudioJob < ApplicationJob
  queue_as :audio_processing
  retry_on StandardError, wait: :polynomially_longer, attempts: 3

  def perform(media_file_id)
    media_file = MediaFile.find(media_file_id)
    return if media_file.processing_status == "ready"

    # Check if ffmpeg is available
    unless system("which ffmpeg > /dev/null 2>&1")
      Rails.logger.info "ffmpeg not available — marking media file ready without metadata"
      media_file.update!(processing_status: "ready")
      # Still sync the known file size to the episode so the RSS enclosure length is correct
      if media_file.file_size.to_i > 0
        media_file.episode&.update!(audio_file_size: media_file.file_size)
      end
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
        metadata: { bitrate: movie.bitrate, audio_codec: safe_utf8(movie.audio_codec) }
      )

      peaks = extract_waveform_peaks(tmp.path)
      media_file.episode&.update!(
        audio_duration_seconds: duration,
        audio_file_size:        tmp.size,
        waveform_peaks:         peaks.presence
      )
    end
  rescue => e
    media_file&.update!(processing_status: "failed")
    raise e
  end

  private

  def safe_utf8(str)
    str.to_s.encode("UTF-8", invalid: :replace, undef: :replace, replace: "")
  end

  def extract_waveform_peaks(audio_path, num_points: 200)
    raw = `ffmpeg -i "#{audio_path}" -f f32le -acodec pcm_f32le -ar 8000 -ac 1 - 2>/dev/null`
    samples = raw.unpack("f*")
    return [] if samples.empty?

    chunk_size = [samples.length / num_points, 1].max
    peaks = samples.each_slice(chunk_size).map { |chunk| chunk.map(&:abs).max.to_f }
    peaks = peaks.first(num_points)
    max_peak = peaks.max
    return [] if max_peak.zero?
    peaks.map { |p| (p / max_peak).round(3) }
  rescue => e
    Rails.logger.warn "Waveform peak extraction failed: #{e.message}"
    []
  end

  def download_file(url, tmp)
    tmp.binmode
    uri = URI.parse(url)
    Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == "https") do |http|
      http.request_get(uri.request_uri) { |r| r.read_body { |chunk| tmp.write(chunk) } }
    end
    tmp.flush
    tmp.rewind
  end
end
