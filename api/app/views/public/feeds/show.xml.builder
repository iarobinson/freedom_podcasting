xml.instruct! :xml, version: "1.0", encoding: "UTF-8"
xml.rss version: "2.0",
  "xmlns:itunes"  => "http://www.itunes.com/dtds/podcast-1.0.dtd",
  "xmlns:atom"    => "http://www.w3.org/2005/Atom",
  "xmlns:content" => "http://purl.org/rss/1.0/modules/content/",
  "xmlns:media"   => "http://www.rssboard.org/media-rss",
  "xmlns:podcast" => "https://podcastindex.org/namespace/1.0" do

  xml.channel do
    feed_url = "#{request.protocol}#{request.host_with_port}/feeds/#{podcast.slug}"

    xml.title         podcast.title
    xml.description   podcast.description
    xml.link          podcast.website_url.presence || feed_url
    xml.language      podcast.language
    xml.copyright     podcast.copyright.presence || "© #{Time.current.year} #{podcast.author}"
    xml.lastBuildDate Time.current.rfc2822
    xml.tag!("atom:link", href: feed_url, rel: "self", type: "application/rss+xml")

    xml.tag! "itunes:author",   podcast.author
    xml.tag! "itunes:subtitle", podcast.description.truncate(255)
    xml.tag! "itunes:summary",  podcast.description
    xml.tag! "itunes:explicit", podcast.explicit ? "true" : "false"
    xml.tag! "itunes:type",     podcast.podcast_type

    artwork_url = podcast.artwork_url.presence || ENV["PLATFORM_DEFAULT_ARTWORK_URL"]
    if artwork_url.present?
      xml.image do
        xml.url   artwork_url
        xml.title podcast.title
        xml.link  podcast.website_url.presence || feed_url
      end
      xml.tag! "itunes:image", href: artwork_url
    end

    if podcast.category.present?
      xml.tag! "itunes:category", text: podcast.category
    end

    xml.tag! "itunes:owner" do
      xml.tag! "itunes:name",  podcast.author
      xml.tag! "itunes:email", podcast.email
    end

    xml.tag! "podcast:locked", "no"

    episodes.each do |episode|
      xml.item do
        xml.title       episode.title
        xml.description { xml.cdata! episode.description }
        xml.guid        episode.guid, isPermaLink: "false"
        xml.pubDate     episode.published_at.rfc2822 if episode.published_at

        xml.tag! "itunes:title",       episode.title
        xml.tag! "itunes:author",      podcast.author
        xml.tag! "itunes:explicit",    episode.explicit ? "true" : "false"
        xml.tag! "itunes:episodeType", episode.episode_type
        xml.tag! "itunes:episode",     episode.episode_number if episode.episode_number
        xml.tag! "itunes:season",      episode.season_number  if episode.season_number
        xml.tag! "itunes:summary",     episode.summary.presence || episode.description.truncate(255)

        if episode.audio_duration_seconds
          xml.tag! "itunes:duration", episode.audio_duration_seconds
        end

        if episode.audio_url.present?
          xml.enclosure(
            url:    "#{request.protocol}#{request.host_with_port}/feeds/#{podcast.slug}/episodes/#{episode.guid}",
            length: episode.audio_file_size.to_i,
            type:   episode.audio_content_type.presence || "audio/mpeg"
          )
        end

        xml.tag!("content:encoded") { xml.cdata! episode.description }
      end
    end
  end
end
