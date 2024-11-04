xml.instruct! :xml, version: "1.0", encoding: "UTF-8"
xml.rss version: "2.0", xmlns:podcast="https://podcastindex.org/namespace/1.0" do
  xml.channel do
    xml.author @show.host
    xml.copyright Time.now.year
    xml.title @show.title
    xml.description @show.description
    xml.docs "http://blogs.law.harvard.edu/tech/rss"
    xml.generator "Freedom Podcasting Company Feed Generator v1.0.0"
    xml.language "en-us"
    xml.link show_url(@show)
    xml.pubDate @show.created_at.rfc2822
    xml.ttl 60  # Time to live, optional
    xml.webMaster "accounts@freedompodcasting.com"

    xml.image do
      xml.description "Image description here... maybe just the show description??"
      xml.link "link to the podcast's home page"
      xml.title "Title Here"
      xml.url "Show image url here"
      xml.height 1400
      xml.width 1400
    end
  
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
