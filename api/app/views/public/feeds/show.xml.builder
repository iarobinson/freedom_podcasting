xml.instruct! :xml, version: "1.0", encoding: "UTF-8"
xml.rss(
  version: "2.0",
  "xmlns:itunes" => "http://www.itunes.com/dtds/podcast-1.0.dtd",
  "xmlns:content" => "http://purl.org/rss/1.0/modules/content/",
  "xmlns:podcast" => "https://podcastindex.org/namespace/1.0",
  "xmlns:atom" => "http://www.w3.org/2005/Atom"
) do
  xml.channel do
    # Atom self-link (required by validators)
    xml.tag!("atom:link",
      href: public_rss_feed_url(podcast_slug: podcast.slug, host: ENV.fetch("API_HOST", "api.freedompods.com")),
      rel: "self",
      type: "application/rss+xml"
    )

    # Core channel elements
    xml.title           podcast.title
    xml.link            podcast.website_url.presence || "https://freedompods.com/#{podcast.slug}"
    xml.description     podcast.description
    xml.language        podcast.language || "en"
    xml.copyright       podcast.copyright if podcast.copyright.present?
    xml.lastBuildDate   Time.current.rfc2822
    xml.generator       "FreedomPods https://freedompods.com"

    # iTunes channel tags
    xml.tag!("itunes:title",    podcast.title)
    xml.tag!("itunes:author",   podcast.author)
    xml.tag!("itunes:summary",  podcast.description)
    xml.tag!("itunes:explicit", podcast.explicit ? "true" : "false")
    xml.tag!("itunes:type",     podcast.podcast_type || "episodic")

    xml.tag!("itunes:owner") do
      xml.tag!("itunes:name",  podcast.author)
      xml.tag!("itunes:email", podcast.email)
    end

    if podcast.artwork_url.present?
      xml.image do
        xml.url   podcast.artwork_url
        xml.title podcast.title
        xml.link  podcast.website_url.presence || "https://freedompods.com/#{podcast.slug}"
      end
      xml.tag!("itunes:image", href: podcast.artwork_url)
    end

    if podcast.category.present?
      xml.tag!("itunes:category", text: podcast.category) do
        xml.tag!("itunes:category", text: podcast.subcategory) if podcast.subcategory.present?
      end
    end

    # Episodes
    episodes.each do |episode|
      xml.item do
        xml.title           episode.title
        xml.guid(episode.guid, isPermaLink: "false") # GUID must never change
        xml.pubDate         episode.published_at.rfc2822
        xml.description     { xml.cdata! episode.description }
        xml.tag!("content:encoded") { xml.cdata! episode.description }

        # iTunes episode tags
        xml.tag!("itunes:title",       episode.title)
        xml.tag!("itunes:author",      podcast.author)
        xml.tag!("itunes:explicit",    episode.explicit ? "true" : "false")
        xml.tag!("itunes:episodeType", episode.episode_type || "full")
        xml.tag!("itunes:summary",     episode.summary) if episode.summary.present?

        xml.tag!("itunes:episode", episode.episode_number) if episode.episode_number.present?
        xml.tag!("itunes:season",  episode.season_number)  if episode.season_number.present?

        if episode.audio_duration_seconds.present?
          xml.tag!("itunes:duration", episode.itunes_duration)
        end

        if episode.artwork_url.present?
          xml.tag!("itunes:image", href: episode.artwork_url)
        end

        if episode.keywords.present?
          xml.tag!("itunes:keywords", episode.keywords)
        end

        # Enclosure — the actual audio file (required for podcast clients)
        if episode.audio_url.present?
          xml.enclosure(
            url: episode.audio_url,
            length: episode.audio_file_size || 0,
            type: episode.audio_content_type || "audio/mpeg"
          )
        end
      end
    end
  end
end
