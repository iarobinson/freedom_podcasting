namespace :utilities do

  desc "Add Users to Shows"
  task add_users_to_shows: :environment do
    @administrators = User.where(role: "administrator")
    @ali = User.where(email: "ali@testing.com").first
    @ben = User.where(email: "ben@testing.com").first
    @mason = User.where(email: "mason@testing.com").first
    @matt = User.where(email: "matt@testing.com").first
    @milo = User.where(email: "milo@testing.com").first
    @nomes = User.where(email: "nomes@testing.com").first
    @sylvia = User.where(email: "sylvia@testing.com").first

    @glambition = Show.where(feed_url: "https://alibrown.com/category/glambition/feed").first
    @glambition.users << [@ali, @nomes, @administrators]

    @question_mark = Show.where(feed_url: "https://ianrobinson.net/category/question-mark/feed").first
    @question_mark.users << [@matt, @administrators]

    @stay_inspired = Show.where(feed_url: "http://kongitfarrell.libsyn.com/rss").first
    @stay_inspired.users << [@nomes, @administrators]

    @venture_studios = Show.where(feed_url: "http://feeds.soundcloud.com/users/soundcloud:users:171934475/sounds.rss").first
    @venture_studios.users << [@matt, @administrators]

    @successfully_ny = Show.where(feed_url: "http://alexshalman.libsyn.com/rss").first
    @successfully_ny.users << [@matt, @administrators]

    @voices_4_ed = Show.where(feed_url: "http://voices4ed.libsyn.com/rss").first
    @voices_4_ed.users << [@mason, @administrators]

    @ready_set_love = Show.where(feed_url: "http://readysetlove.libsyn.com/rss").first
    @ready_set_love.users << [@mason, @administrators]

    @first_but_last = Show.where(feed_url: "https://firstbutlast.libsyn.com/rss").first
    @first_but_last.users << [@mason, @administrators]

    @lets_talk_hemp = Show.where(feed_url: "https://letstalkhemp.libsyn.com/rss").first
    @lets_talk_hemp.users << [@mason, @administrators]

    add_users_to_show_by_feed("https://letstalkhemp.libsyn.com/rss", [@mason, @administrators])
  end

  def add_users_to_show_by_feed(feed, user_array)
    @show = Show.where(feed_url: feed).first
    user_array.each do |user|
      @show.users << user unless @show.users.include?(user)
    end
    # binding.pry
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
      show.title = content.title
      show.host = content.itunes_author
      show.category = content.itunes_categories
      show.description = content.description
      show.save
    end
  end

  desc "Generate invoices for all producers to be filled out"
  task generate_new_round_of_monthly_invoices: :environment do
    @producers = User.where(role: "producer")
    @administrators = User.where(role: "administrator")
    @producers.each do |producer|
      invoice = Invoice.new()
      invoice.users << [producer, @administrators]
      invoice.save
      p "Invoice added to #{producer.email}"
    end
  end
end
