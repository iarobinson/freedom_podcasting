xml.instruct! :xml, version: "1.0", encoding: "UTF-8"
xml.rss version: "2.0",
        "xmlns:itunes" => "http://www.itunes.com/dtds/podcast-1.0.dtd",
        "xmlns:atom" => "http://www.w3.org/2005/Atom" do

  xml.channel do
    xml.title        @show.title
    xml.link         show_url(@show)
    xml.description  @show.description
    xml.language     "en-us"
    xml.pubDate      @episodes.first&.published&.rfc2822
    xml.lastBuildDate Time.now.rfc2822

    xml.tag! "atom:link", href: feed_show_url(@show, format: :xml), rel: "self", type: "application/rss+xml"
    xml.tag! "itunes:author", @show.host || "Freedom Podcasting"
    xml.tag! "itunes:summary", @show.description
    xml.tag! "itunes:explicit", "no"

    if @show.show_art.attached?
      xml.tag! "itunes:image", href: url_for(@show.show_art)
    end

    xml.tag! "itunes:owner" do
      xml.tag! "itunes:name", @show.title || "Freedom Podcasting"
      xml.tag! "itunes:email", @show.itunes_contact_email ||"accounts@freedompodcasting.com"
    end

  xml.tag! "itunes:category", text: @show.category_one do
    xml.tag! "itunes:category", text: @show.category_two
  end

    @episodes.each do |episode|
      xml.item do
        xml.title       episode.title
        xml.description episode.description
        xml.pubDate     episode.updated_at.rfc2822
        xml.guid        show_episode_url(@show, episode)
        xml.link        show_episode_url(@show, episode)
        xml.tag! "itunes:duration", episode.duration || "00:00:00"

        if episode.enclosed_audio.attached?
          url = rails_blob_url(episode.enclosed_audio, host: request.base_url)
          size = episode.enclosed_audio.byte_size
          type = episode.enclosed_audio.content_type

          xml.enclosure url: url, length: size, type: type
        end
      end
    end
  end
end
