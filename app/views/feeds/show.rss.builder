xml.instruct! :xml, version: "1.0", encoding: "UTF-8"
xml.rss version: "2.0",
    "xmlns:itunes" => "http://www.itunes.com/dtds/podcast-1.0.dtd",
    "xmlns:podcast" => "https://podcastindex.org/namespace/1.0" do
  xml.channel do
    xml.title @show.title
    xml.link show_url(@show)
    xml.language "en-us"
    xml.description @show.description
    xml.generator "FreedomPodcasting.com - Feed Generator v1.0.0"
    xml.pubDate @show.created_at.rfc2822
    xml.lastBuildDate @show.created_at.rfc2822
    xml.ttl 60
    xml.copyright Time.now.year
    xml.docs "http://blogs.law.harvard.edu/tech/rss"
    xml.webMaster "accounts@freedompodcasting.com"

    # iTunes/ podcast-specific tags
    xml.tag! "xml.author", @show.host
    xml.tag! "itunes:summary", @show.description
    xml.tag! "itunes:explicit", "no" # TODO: Make this dynamic
    xml.tag! "itunes:author", @show.host
    xml.tag! "itunes:image", @show.show_art.url

    xml.image do
      xml.url "Show image url here"
      xml.title @show.title
      xml.link  url_for(@show.show_art) #TODO This needs to link to the show art
      xml.description @show.description
      xml.height 1400
      xml.width 1400
    end
  
    @episodes.each do |episode|
      xml.item do
        xml.title episode.title
        xml.description episode.description
        xml.pubDate episode.created_at.rfc2822

        xml.guid @show.id.to_s + "-" + episode.id.to_s # TODO: This needs to be rethunk
        xml.link url_for(episode.enclosed_audio)

        xml.enclosure(
          url: rails_blob_url(episode.enclosed_audio, only_path: false),
          length: episode.enclosed_audio.byte_size,
          type: "audio/mpeg"
        )

        xml.tag! "itunes:duration", Time.at(episode.enclosed_audio.metadata[:duration] || 0).utc.strftime("%H:%M:%S") rescue nil # TODO: This needs to be dynamic
        xml.tag! "itunes:explicit", "no" # TODO: This needs to be dynamic
      end
    end
  end
end
