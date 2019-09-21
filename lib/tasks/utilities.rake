namespace :utilities do

  desc "Add Users to Shows"
  task add_users_to_shows: :environment do
    @ian = User.where(email: "ian@testing.com").first
    @ali = User.where(email: "ali@testing.com").first
    @milo = User.where(email: "milo@testing.com").first
    @glambition = Show.where(title: "Glambition Radio with Ali Brown").first
    @love_affair_travel = Show.where(
      title: "Love Affair Travel Podcast - Stories of Adventure and Enterprise"
    ).first
    @love_affair_travel.users << [@milo, @ian]
    @glambition.users << [@ali, @ian]
  end

  desc "Sync Episodes Based on Podcast Feeds"
  task sync_episodes_to_podcast_feeds: :environment do
    Feed.all.each do |feed|
      xml = HTTParty.get(feed.url).body
      content = Feedjira.parse(xml)
      content.entries.each do |episode|
        p episode.title, " <= episode.title"
        if Episode.all.where(title: episode.title).size.zero?
          new_episode = Episode.new(
            title: episode.title,
            updated_at: episode.published,
            content_encoded: episode.content,
            enclosure: episode.enclosure_url,
            link: episode.url,
            description: episode.itunes_summary
          )
          new_episode.show = Show.find(feed.show_id)
          new_episode.feed = feed
          new_episode.save
          p "#{new_episode.title} added to the database"
        else
          p "#{episode.title} skipped as it's already in the database."
        end
      end
    end
  end
end
