class ReprocessPodcastAudioJob < ApplicationJob
  queue_as :default

  def perform(podcast_id)
    podcast = Podcast.find(podcast_id)
    org     = podcast.organization
    import  = org.podcast_imports.find_by(podcast_id: podcast_id)
    raise "No import record found for podcast #{podcast_id}" unless import

    xml = fetch_rss(import.rss_url)
    doc = Nokogiri::XML(xml)
    doc.remove_namespaces!

    requeued = 0
    doc.xpath("//channel/item").each do |item|
      enclosure_url = item.at_xpath("enclosure")&.attr("url")&.strip
      next if enclosure_url.blank?

      guid    = item.at_xpath("guid")&.text&.strip.presence
      episode = guid ? podcast.episodes.find_by(guid: guid) : nil
      next unless episode
      next unless episode.audio_file_size.to_i == 0

      content_type = item.at_xpath("enclosure")&.attr("type")&.strip.presence || "audio/mpeg"
      MigrateEpisodeAudioJob.perform_later(episode.id, enclosure_url, content_type, nil)
      requeued += 1
    end

    Rails.logger.info "ReprocessPodcastAudioJob: re-queued #{requeued} episodes for podcast #{podcast_id}"
  end

  private

  def fetch_rss(url)
    uri = URI.parse(url)
    redirects = 0
    loop do
      raise "Too many redirects" if redirects > 5
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = uri.scheme == "https"
      http.open_timeout = 10
      http.read_timeout = 30
      response = http.get(uri.request_uri, "User-Agent" => "FreedomPodcasting/1.0 (RSS Importer)")
      case response.code.to_i
      when 200 then return response.body
      when 301, 302, 307, 308
        uri = URI.parse(response["Location"])
        redirects += 1
      else
        raise "HTTP #{response.code} fetching RSS feed"
      end
    end
  end
end
