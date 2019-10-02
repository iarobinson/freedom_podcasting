module FeedsHelper

  def fetch_episodes(feed, show)
    xml = HTTParty.get(feed.url).body
    content = Feedjira.parse(xml)
    content.entries.each do |episode|
      if Episode.all.where(title: episode.title).size.zero?
        new_episode = Episode.new(
          title: episode.title,
          updated_at: episode.published,
          content_encoded: episode.content,
          enclosure: episode.enclosure_url,
          link: episode.url,
          description: episode.itunes_summary
        )
        new_episode.show = Show.find(show.id)
        new_episode.feed = feed
        new_episode.save
      end
    end
  end
end
