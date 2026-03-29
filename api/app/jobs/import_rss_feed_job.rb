class ImportRssFeedJob < ApplicationJob
  queue_as :default
  retry_on StandardError, wait: :polynomially_longer, attempts: 2

  def perform(podcast_import_id)
    import = PodcastImport.find(podcast_import_id)
    return if import.status == "done"

    import.update!(status: "processing")
    org = import.organization

    # 1. Fetch RSS XML
    xml = fetch_rss(import.rss_url)

    # 2. Parse
    doc = Nokogiri::XML(xml)
    doc.remove_namespaces!
    channel = doc.at_xpath("//channel")
    raise "No RSS channel found in feed" unless channel

    # 3. Build Podcast from channel metadata
    title       = channel.at_xpath("title")&.text&.strip.presence || "Imported Podcast"
    description = (channel.at_xpath("description")&.text || channel.at_xpath("summary")&.text)&.strip.presence || title
    author      = (channel.at_xpath("author")&.text || extract_name(channel.at_xpath("managingEditor")&.text))&.strip.presence || "Unknown"
    email       = (channel.at_xpath("owner/email")&.text || extract_email(channel.at_xpath("managingEditor")&.text))&.strip.presence || org.owner&.email || "podcast@example.com"
    language    = channel.at_xpath("language")&.text&.strip.presence || "en"
    category    = channel.at_xpath("category")&.attr("text")&.strip
    explicit    = channel.at_xpath("explicit")&.text&.strip == "true"
    podcast_type = (channel.at_xpath("type")&.text&.strip || "episodic")
    website_url = channel.at_xpath("link")&.text&.strip
    copyright   = channel.at_xpath("copyright")&.text&.strip
    artwork_url = channel.at_xpath("image/href")&.attr("href") ||
                  channel.at_xpath("image/url")&.text&.strip

    podcast = org.podcasts.create!(
      title:         title,
      description:   description,
      author:        author,
      email:         email,
      language:      language.downcase[0, 10],
      category:      category,
      explicit:      explicit,
      podcast_type:  %w[episodic serial].include?(podcast_type) ? podcast_type : "episodic",
      website_url:   website_url,
      copyright:     copyright,
      artwork_url:   artwork_url,
      slug:          generate_unique_slug(org, title),
      published:     true,
      published_at:  Time.current
    )

    import.update!(podcast_id: podcast.id)

    # 4. Migrate artwork (download + re-host on R2 via ProcessArtworkJob)
    migrate_artwork(podcast, artwork_url, org) if artwork_url.present?

    # 5. Parse episodes
    items = doc.xpath("//channel/item")
    import.update!(total_episodes: items.count)

    if items.empty?
      import.update!(status: "done")
      return
    end

    # 6. Create episodes + enqueue audio downloads
    items.each do |item|
      enclosure_url  = item.at_xpath("enclosure")&.attr("url")&.strip
      content_type   = item.at_xpath("enclosure")&.attr("type")&.strip.presence || "audio/mpeg"
      file_size      = item.at_xpath("enclosure")&.attr("length").to_i
      guid           = item.at_xpath("guid")&.text&.strip.presence || SecureRandom.uuid
      pub_date_str   = item.at_xpath("pubDate")&.text&.strip
      published_at   = pub_date_str.present? ? (Time.parse(pub_date_str) rescue Time.current) : Time.current

      description_text = (item.at_xpath("encoded")&.text || item.at_xpath("description")&.text)&.strip.presence || ""
      summary_text     = item.at_xpath("summary")&.text&.strip.presence

      ep_type    = item.at_xpath("episodeType")&.text&.strip.presence || "full"
      ep_type    = "full" unless %w[full trailer bonus].include?(ep_type)
      ep_number  = item.at_xpath("episode")&.text&.strip.to_i.then { |n| n > 0 ? n : nil }
      ep_season  = item.at_xpath("season")&.text&.strip.to_i.then { |n| n > 0 ? n : nil }
      ep_explicit = item.at_xpath("explicit")&.text&.strip == "true"
      duration   = parse_duration(item.at_xpath("duration")&.text)

      episode = podcast.episodes.create!(
        title:                 item.at_xpath("title")&.text&.strip.presence || "Untitled",
        description:           description_text,
        summary:               summary_text,
        guid:                  guid,
        published_at:          published_at,
        status:                enclosure_url.present? ? "published" : "draft",
        episode_type:          ep_type,
        episode_number:        ep_number,
        season_number:         ep_season,
        explicit:              ep_explicit,
        audio_url:             enclosure_url,
        audio_file_size:       file_size > 0 ? file_size : nil,
        audio_content_type:    content_type,
        audio_duration_seconds: duration
      )

      if enclosure_url.present?
        MigrateEpisodeAudioJob.perform_later(episode.id, enclosure_url, content_type, import.id)
      else
        # No audio — count it immediately as imported
        PodcastImport.where(id: import.id).update_all("imported_episodes = imported_episodes + 1")
        imp = PodcastImport.find(import.id)
        imp.update!(status: "done") if imp.imported_episodes >= imp.total_episodes
      end
    end
  rescue => e
    PodcastImport.find_by(id: podcast_import_id)&.update(
      status: "failed",
      error_message: e.message.truncate(500)
    )
    raise
  end

  private

  def fetch_rss(url)
    uri       = URI.parse(url)
    redirects = 0
    loop do
      raise "Too many redirects" if redirects > 5
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = uri.scheme == "https"
      http.open_timeout = 10
      http.read_timeout = 30
      response = http.get(uri.request_uri, "User-Agent" => "FreedomPodcasting/1.0 (RSS Importer)")
      case response.code.to_i
      when 200
        return response.body
      when 301, 302, 307, 308
        uri = URI.parse(response["Location"])
        redirects += 1
      else
        raise "HTTP #{response.code} fetching RSS feed"
      end
    end
  end

  def migrate_artwork(podcast, artwork_url, org)
    uri = URI.parse(artwork_url)
    ext = File.extname(uri.path).downcase.presence || ".jpg"
    Tempfile.create(["artwork", ext]) do |tmp|
      download_file(artwork_url, tmp)
      content_type = ext == ".png" ? "image/png" : "image/jpeg"
      r2_key = "organizations/#{org.id}/artwork/#{SecureRandom.uuid}#{ext}"
      File.open(tmp.path, "rb") do |f|
        StorageService.new.upload_data(key: r2_key, data: f, content_type: content_type)
      end
      mf = org.media_files.create!(
        filename:          File.basename(r2_key),
        content_type:      content_type,
        r2_key:            r2_key,
        podcast_id:        podcast.id,
        file_size:         tmp.size,
        processing_status: "processing"
      )
      ProcessArtworkJob.perform_later(mf.id)
    end
  rescue => e
    Rails.logger.warn "ImportRssFeedJob: artwork migration failed (#{e.message}) — keeping external URL"
  end

  def download_file(url, tmp)
    tmp.binmode
    uri = URI.parse(url)
    redirects = 0
    loop do
      raise "Too many redirects fetching file" if redirects > 5
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
            raise "HTTP #{r.code} downloading file"
          end
        end
      end
      break if done
    end
    tmp.flush
    tmp.rewind
  end

  def parse_duration(str)
    return nil if str.blank?
    parts = str.strip.split(":").map(&:to_i)
    case parts.length
    when 1 then parts[0] > 0 ? parts[0] : nil
    when 2 then parts[0] * 60 + parts[1]
    when 3 then parts[0] * 3600 + parts[1] * 60 + parts[2]
    end
  end

  def extract_email(str)
    return nil if str.blank?
    str[/[\w.+-]+@[\w-]+\.[a-z]{2,}/i]
  end

  def extract_name(str)
    return nil if str.blank?
    # "email@example.com (Name)" or just "Name" or "email@example.com"
    if (m = str.match(/\((.+)\)/))
      m[1].strip
    elsif str.include?("@")
      nil
    else
      str.strip
    end
  end

  def generate_unique_slug(org, title)
    base = title.to_s.downcase.strip
                .gsub(/[^a-z0-9]+/, "-")
                .gsub(/\A-+|-+\z/, "")[0, 50]
    base = "podcast" if base.blank?
    slug = base
    n = 2
    while org.podcasts.exists?(slug: slug)
      slug = "#{base}-#{n}"
      n += 1
    end
    slug
  end
end
