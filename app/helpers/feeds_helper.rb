module FeedsHelper
  require 'open-uri'

  def fetch_episodes(feed, show)
    xml = HTTParty.get(feed.url).body
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
        )
        new_episode.show = Show.find(show.id)

        show_art_from_feed = open(content.itunes_image)
        new_episode.show.show_art.attach(
          io: show_art_from_feed,
          filename: "#{new_episode.show.title.underscore}_show_art.jpg}"
        )

        new_episode.feed = feed
        new_episode.save
      end
    end
  end
end
