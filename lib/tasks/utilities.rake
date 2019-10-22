namespace :utilities do
  require 'open-uri'

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

    add_users_to_show_by_feed("https://alibrown.com/category/glambition/feed", [@ali, @nomes, @administrators])
    add_users_to_show_by_feed("https://ianrobinson.net/category/question-mark/feed", [@matt, @administrators])
    add_users_to_show_by_feed("http://kongitfarrell.libsyn.com/rss", [@nomes, @administrators])
    add_users_to_show_by_feed("http://feeds.soundcloud.com/users/soundcloud:users:171934475/sounds.rss", [@matt, @administrators])
    add_users_to_show_by_feed("http://alexshalman.libsyn.com/rss", [@matt, @administrators])
    add_users_to_show_by_feed("http://voices4ed.libsyn.com/rss", [@mason, @administrators])
    add_users_to_show_by_feed("http://readysetlove.libsyn.com/rss", [@mason, @administrators])
    add_users_to_show_by_feed("https://firstbutlast.libsyn.com/rss", [@mason, @administrators])
    add_users_to_show_by_feed("https://letstalkhemp.libsyn.com/rss", [@mason, @administrators])
    add_users_to_show_by_feed("http://beautybiz.libsyn.com/rss", [@sylvia, @administrators])
    add_users_to_show_by_feed("http://moneytwist.libsyn.com/rss", [@sylvia, @administrators])
    add_users_to_show_by_feed("http://shesgotmoxie.libsyn.com/rss", [@sylvia, @administrators])
    add_users_to_show_by_feed("http://karagoldin.libsyn.com/rss", [@sylvia, @administrators])
    add_users_to_show_by_feed("https://terricole.libsyn.com/theterricoleshow", [@sylvia, @administrators])
    add_users_to_show_by_feed("http://baethdavis.libsyn.com/rss", [@sylvia, @administrators])
    add_users_to_show_by_feed("http://conversationswith.libsyn.com/rss", [@milo, @administrators])
    add_users_to_show_by_feed("http://businessmiracles.libsyn.com/rss", [@milo, @administrators])
    add_users_to_show_by_feed("http://drsteven.libsyn.com/rss", [@milo, @administrators])
    add_users_to_show_by_feed("https://nionlife.com/feed/podcast/", [@milo, @administrators])
    add_users_to_show_by_feed("http://www.asianefficiency.com/feed/podcast/", [@milo, @administrators])
    # add_users_to_show_by_feed("https://advancedmanufacturing.org/feed/podcast/", [@ben, @administrators])
    add_users_to_show_by_feed("http://leadershipandbusiness.libsyn.com/rss", [@ben, @administrators])
    add_users_to_show_by_feed("http://neuronfire.libsyn.com/neuronfire", [@ben, @administrators])
    add_users_to_show_by_feed("http://www.toptradersunplugged.com/feed/podcast", [@ben, @administrators])
  end

  def add_users_to_show_by_feed(feed, user_array)
    @show = Show.where(feed_url: feed).first
    user_array.each do |user|
      @show.users << user unless @show.users.include?(user)
    end
  end

  desc "Sync Episodes Based on Podcast Feeds"
  task sync_with_podcast_feed: :environment do
    Show.all.each do |show|
      xml = HTTParty.get(show.feed_url).body
      content = Feedjira.parse(xml)
      content.entries.each do |episode|
        if Episode.all.where(title: episode.title).size.zero?
          cost = calculate_episode_cost(episode.itunes_duration) if episode.itunes_duration

          new_episode = Episode.new(
            title: episode.title,
            updated_at: episode.published,
            content_encoded: episode.content,
            enclosure: episode.enclosure_url,
            description: episode.itunes_summary,
            itunes_duration: episode.itunes_duration,
            client_cost: cost
          )
          new_episode.show = show
          new_episode.save
        end
      end

      file = open(content.itunes_image)
      custom_file_name = content.title.downcase.gsub(/[^a-z ]/, '').gsub(" ", "_") + "_show_art"
      show.show_art.attach(io: file, filename: custom_file_name, content_type: "image/jpg")
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
      @invoice = Invoice.new()
      @invoice.users << [producer, @administrators]
      @invoice.save

      producer.shows.each do |show|
        @invoice.episodes << show.episodes.where("updated_at > ?", 30.days.ago)
      end
      @invoice.calculate_total
    end
  end

  def calculate_episode_cost(duration_string)
    total_minutes = 0
    time_array = duration_string.split(":")
    index = time_array.length - 1
    while index >= 0
      if time_array.length == 3
        total_minutes += time_array[index].to_i if index == 1
        total_minutes += (time_array[index].to_i * 60) if index == 0
      elsif time_array.length == 2
        total_minutes += time_array[index].to_i if index == 0
      end
      index -= 1
    end

    if total_minutes < 10
      "80"
    elsif total_minutes < 20
      "110"
    elsif total_minutes < 30
      "130"
    elsif total_minutes < 40
      "150"
    elsif total_minutes < 50
      "170"
    elsif total_minutes < 60
      "190"
    elsif total_minutes < 70
      "210"
    elsif total_minutes < 80
      "230"
    elsif total_minutes < 90
      "250"
    elsif total_minutes < 100
      "270"
    elsif total_minutes < 110
      "290"
    elsif total_minutes < 120
      "310"
    else
      "Unknown"
    end
  end
end
