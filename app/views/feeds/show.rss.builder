xml.instruct! :xml, version: "1.0", encoding: "UTF-8"
xml.rss version: "2.0", xmlns:podcast="https://podcastindex.org/namespace/1.0" do
  xml.channel do
    xml.title @show.title
    xml.description @show.description
    xml.link show_url(@show)
    xml.language "en-us"
    xml.ttl 60  # Time to live, optional
    xml.pubDate @show.created_at.rfc2822
    xml.copyright Time.now.year
    xml.webMaster "accounts@freedompodcasting.com"

    @episodes.each do |episode|
      xml.item do
        xml.title episode.title
        xml.description episode.description
        xml.pubDate episode.created_at.rfc2822
        xml.guid "Need to learn how guid works"
        xml.link "Need to learn what xml link is for in podcast feeds"

        xml.enclosure url: rails_blob_url(episode.enclosed_audio), length: episode.enclosed_audio.byte_size, type: "audio/mpeg"
      end
    end
  end
end
