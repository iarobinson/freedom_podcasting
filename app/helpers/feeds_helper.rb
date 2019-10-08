module FeedsHelper
  require 'open-uri'

  def fetch_episodes(show)
    xml = HTTParty.get(show.feed_url).body
    content = Feedjira.parse(xml)

    content.entries.each do |episode|
      if Episode.all.where(title: episode.title).size.zero?
        new_episode = Episode.new(
          link: episode.url,
          title: episode.title,
          updated_at: episode.published,
          enclosure: episode.enclosure_url,
          content_encoded: episode.content,
          description: episode.itunes_summary,
          pubDate: episode.published,
          itunes_explicit: episode.itunes_explicit,
          itunes_duration: episode.itunes_duration,
          paid: false,
        )
        new_episode.show = show
        new_episode.save
      end
    end

    # binding.pry

    # download = open(content.itunes_image)
    # IO.copy_stream(download, "#{content.title.underscore.gsub(" ", "_")}_show_art.jpg}")


    # show.show_art.attach(content.itunes_image)
    #
    # show_art_from_feed = open(content.itunes_image)
    # show.show_art.attach(
    #   io: show_art_from_feed,
    #   filename: "#{content.title.underscore.gsub(" ", "_")}_show_art.jpg}"
    # )
    #
    # show.show_art

    show.title = content.title
    show.host = content.itunes_author
    show.category = content.itunes_categories
    show.description = content.description
    show.save
  end
end
