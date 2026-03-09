class TranscribeEpisodeJob < ApplicationJob
  queue_as :ai_processing
  retry_on StandardError, wait: :polynomially_longer, attempts: 3

  MAX_WHISPER_BYTES = 24.megabytes

  def perform(episode_id)
    episode = Episode.find_by(id: episode_id)
    return unless episode&.audio_url.present?

    episode.update_column(:transcription_status, "processing")

    Dir.mktmpdir do |dir|
      # 1. Download original audio
      ext = File.extname(episode.audio_url.split("?").first).presence || ".mp3"
      original_path = File.join(dir, "original#{ext}")
      download_file(episode.audio_url, original_path)

      # 2. Transcode to 16kHz mono 32kbps MP3 (drastically reduces file size)
      transcription_path = File.join(dir, "transcription.mp3")
      movie = FFMPEG::Movie.new(original_path)
      movie.transcode(
        transcription_path,
        audio_sample_rate: 16_000,
        audio_channels: 1,
        audio_bitrate: "32k",
        custom: %w[-vn]  # drop any video streams
      )

      if File.size(transcription_path) > MAX_WHISPER_BYTES
        raise "Transcoded audio still exceeds 25MB (#{File.size(transcription_path)} bytes)"
      end

      # 3. Send to OpenAI Whisper (verbose_json gives us real segment timestamps)
      client = OpenAI::Client.new(access_token: ENV.fetch("OPENAI_API_KEY"))
      response = client.audio.transcribe(
        parameters: {
          model:           "whisper-1",
          file:            File.open(transcription_path),
          response_format: "verbose_json"
        }
      )

      # 4. Build timestamped transcript — one line per ~30s chunk: "[M:SS] text…"
      segments = response.is_a?(Hash) ? (response["segments"] || []) : []
      transcript = build_timestamped_transcript(segments)
      # Fallback to plain text if segment parsing yields nothing
      transcript = response["text"].to_s if transcript.blank? && response.is_a?(Hash)

      # 5. Persist transcript
      episode.update!(transcript: transcript, transcription_status: "done")

      # 5. Chain to metadata generation for audio-first episodes
      if episode.title == Episode::AI_PLACEHOLDER_TITLE
        GenerateEpisodeMetadataJob.perform_later(episode.id)
      end
    end
  rescue => e
    Episode.find_by(id: episode_id)&.update_column(:transcription_status, "failed")
    raise e
  end

  private

  # Groups Whisper segments into ~30-second chunks and labels each with a real timestamp.
  def build_timestamped_transcript(segments)
    return "" if segments.empty?

    lines        = []
    chunk_start  = nil
    chunk_texts  = []

    segments.each do |seg|
      t = seg["start"].to_f
      if chunk_start.nil? || t - chunk_start >= 30.0
        lines << "[#{fmt_time(chunk_start)}] #{chunk_texts.join(" ").strip}" if chunk_start
        chunk_start = t
        chunk_texts = [seg["text"].to_s.strip]
      else
        chunk_texts << seg["text"].to_s.strip
      end
    end
    lines << "[#{fmt_time(chunk_start)}] #{chunk_texts.join(" ").strip}" if chunk_start && chunk_texts.any?

    lines.join("\n")
  end

  def fmt_time(seconds)
    total = seconds.to_i
    h = total / 3600
    m = (total % 3600) / 60
    s = total % 60
    h > 0 ? format("%d:%02d:%02d", h, m, s) : format("%d:%02d", m, s)
  end

  def download_file(url, path)
    uri = URI.parse(url)
    Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == "https") do |http|
      http.request_get(uri.request_uri) do |res|
        File.open(path, "wb") { |f| res.read_body { |chunk| f.write(chunk) } }
      end
    end
  end
end
