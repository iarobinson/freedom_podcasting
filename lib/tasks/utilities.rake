namespace :utilities do

  desc "Add Users to Shows"
  task add_users_to_shows: :environment do
    @ian = User.where(email: "ian@testing.com").first
    @ali = User.where(email: "ali@testing.com").first
    @milo = User.where(email: "milo@testing.com").first
    @glambition = Show.third
    @love_affair_travel = Show.second
    @love_affair_travel.users << [@milo, @ian]
    @glambition.users << [@ali, @ian]
  end

  desc "Sync Episodes Based on Podcast Feeds"
  task sync_episodes_to_podcast_show_feed: :environment do
    Show.all.each do |show|
      xml = HTTParty.get(show.feed_url).body
      content = Feedjira.parse(xml)
      content.entries.each do |episode|
        if Episode.all.where(title: episode.title).size.zero?
          new_episode = Episode.new(
            title: episode.title,
            updated_at: episode.published,
            content_encoded: episode.content,
            enclosure: episode.enclosure_url,
            description: episode.itunes_summary
          )
          new_episode.show = show
          new_episode.save
        end
      end
    end
  end

  desc "Generate invoices for all producers to be filled out"
  task generate_new_round_of_monthly_invoices: :environment do
    producers = User.where(role: "producer")
    producers.each do |producer|
      invoice = Invoice.new()
      invoice.users << producer
      invoice.save
      p "Invoice added to #{producer.email}"
    end
  end
end
