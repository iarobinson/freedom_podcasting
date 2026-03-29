class ProcessArtworkJob < ApplicationJob
  queue_as :default
  retry_on StandardError, wait: :polynomially_longer, attempts: 3

  MAX_BYTES   = 512 * 1_024  # 512 KB — Apple podcast requirement
  MAX_PX      = 3_000        # Apple max dimension
  MIN_QUALITY = 55           # JPEG quality floor before we give up shrinking

  def perform(media_file_id)
    media_file = MediaFile.find(media_file_id)
    return if media_file.processing_status == "ready"

    media_file.update!(processing_status: "processing")

    Tempfile.create(["artwork_in", File.extname(media_file.r2_key)]) do |tmp|
      download_file(media_file.public_url, tmp)

      # Resize to at most MAX_PX × MAX_PX, center-cropped to square, never upscaled
      image = Vips::Image.thumbnail(tmp.path, MAX_PX,
        height: MAX_PX,
        crop:   :centre,
        size:   :down
      )

      # Step quality down until the JPEG fits under 512 KB
      quality = 85
      data    = nil
      loop do
        data = image.jpegsave_buffer(Q: quality, strip: true)
        break if data.bytesize <= MAX_BYTES || quality <= MIN_QUALITY
        quality -= 5
      end

      # Overwrite the original R2 object with the optimised JPEG
      StorageService.new.upload_data(
        key:          media_file.r2_key,
        data:         data,
        content_type: "image/jpeg"
      )

      media_file.update!(
        processing_status: "ready",
        content_type:      "image/jpeg",
        file_size:         data.bytesize
      )

      # Keep podcast.artwork_url in sync (URL is unchanged; just ensures freshness)
      media_file.podcast&.update!(artwork_url: media_file.public_url)
    end
  rescue => e
    media_file&.update!(processing_status: "failed")
    raise e
  end

  private

  def download_file(url, tmp)
    tmp.binmode
    uri = URI.parse(url)
    redirects = 0
    loop do
      raise "Too many redirects fetching artwork" if redirects > 5
      done = false
      Net::HTTP.start(uri.host, uri.port,
                      use_ssl: uri.scheme == "https",
                      open_timeout: 10,
                      read_timeout: 60) do |http|
        http.request_get(uri.request_uri, "User-Agent" => "FreedomPodcasting/1.0") do |r|
          case r.code.to_i
          when 200..299
            r.read_body { |chunk| tmp.write(chunk) }
            done = true
          when 301, 302, 303, 307, 308
            uri = URI.parse(r["Location"])
            redirects += 1
          else
            raise "HTTP #{r.code} downloading artwork"
          end
        end
      end
      break if done
    end
    tmp.flush
    tmp.rewind
  end
end
