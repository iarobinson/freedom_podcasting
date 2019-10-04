module FeedsHelper
  require 'open-uri'

  def fetch_episodes(feed, show)
    xml = HTTParty.get(feed.url).body
    content = Feedjira.parse(xml)

    show_art_from_feed = open(content.itunes_image)
    show.show_art.attach(
      io: show_art_from_feed,
      filename: "#{show.title.underscore}_show_art.jpg}"
    )

    content.entries.each do |episode|
      if Episode.all.where(title: episode.title).size.zero?
        new_episode = Episode.new(
          link: episode.url,
          title: episode.title,
          updated_at: episode.published,
          enclosure: episode.enclosure_url,
          content_encoded: episode.content,
          description: episode.itunes_summary,
        )
        new_episode.show = show
        new_episode.feed = feed
        new_episode.save
      end
    end
  end
end
