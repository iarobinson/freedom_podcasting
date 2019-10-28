namespace :utilities do
  require 'open-uri'

  desc "Add Founding Users"
  task add_founding_users: :environment do
    User.new(email: "ali@testing.com", password: "testing", role: "client",
      first_name: "Ali", last_name: ""
    ).save
    User.new(email: "v@testing.com", password: "testing", role: "producer",
      first_name: "V", last_name: ""
    ).save
    User.new(email: "ben@testing.com", password: "testing", role: "producer",
      first_name: "Ben", last_name: ""
    ).save
    User.new(email: "matt@testing.com", password: "testing", role: "producer",
      first_name: "Matt", last_name: ""
    ).save
    User.new(email: "milo@testing.com", password: "testing", role: "producer",
      first_name: "Milo", last_name: ""
    ).save
    User.new(email: "mason@testing.com", password: "testing", role: "producer",
      first_name: "Mason", last_name: ""
    ).save
    User.new(email: "nomes@testing.com", password: "testing", role: "producer",
      first_name: "Nomes", last_name: ""
    ).save
    User.new(email: "sylvia@testing.com", password: "testing", role: "producer",
      first_name: "Sylvia", last_name: ""
    ).save
    User.new(email: "ian@testing.com", password: "testing", role: "administrator",
      first_name: "Ian", last_name: ""
    ).save
  end

  desc "Add Founding Shows"
  task add_founding_shows: :environment do
    client_podcast_RSS_feeds.each do |rss_feed|
      Show.new(feed_url: rss_feed).save
    end
  end

  desc "Add Users to Shows"
  task add_users_to_shows: :environment do
    @administrators = User.where(role: "administrator")
    @ali = User.where(email: "ali@testing.com").first
    @ben = User.where(email: "ben@testing.com").first
    @matt = User.where(email: "matt@testing.com").first
    @milo = User.where(email: "milo@testing.com").first
    @nomes = User.where(email: "nomes@testing.com").first
    @mason = User.where(email: "mason@testing.com").first
    @sylvia = User.where(email: "sylvia@testing.com").first

    add_users_to_show_by_feed("http://voices4ed.libsyn.com/rss", [@mason, @administrators])
    add_users_to_show_by_feed("http://drsteven.libsyn.com/rss", [@milo, @administrators])
    add_users_to_show_by_feed("http://beautybiz.libsyn.com/rss", [@sylvia, @administrators])
    add_users_to_show_by_feed("http://alexshalman.libsyn.com/rss", [@matt, @administrators])
    add_users_to_show_by_feed("http://moneytwist.libsyn.com/rss", [@sylvia, @administrators])
    add_users_to_show_by_feed("http://karagoldin.libsyn.com/rss", [@sylvia, @administrators])
    add_users_to_show_by_feed("https://nionlife.com/feed/podcast/", [@milo, @administrators])
    add_users_to_show_by_feed("http://baethdavis.libsyn.com/rss", [@sylvia, @administrators])
    add_users_to_show_by_feed("http://readysetlove.libsyn.com/rss", [@mason, @administrators])
    add_users_to_show_by_feed("http://kongitfarrell.libsyn.com/rss", [@nomes, @administrators])
    add_users_to_show_by_feed("https://firstbutlast.libsyn.com/rss", [@mason, @administrators])
    add_users_to_show_by_feed("https://letstalkhemp.libsyn.com/rss", [@mason, @administrators])
    add_users_to_show_by_feed("http://shesgotmoxie.libsyn.com/rss", [@sylvia, @administrators])
    add_users_to_show_by_feed("http://neuronfire.libsyn.com/neuronfire", [@ben, @administrators])
    add_users_to_show_by_feed("http://businessmiracles.libsyn.com/rss", [@milo, @administrators])
    add_users_to_show_by_feed("http://conversationswith.libsyn.com/rss", [@milo, @administrators])
    add_users_to_show_by_feed("http://leadershipandbusiness.libsyn.com/rss", [@ben, @administrators])
    add_users_to_show_by_feed("http://www.asianefficiency.com/feed/podcast/", [@milo, @administrators])
    add_users_to_show_by_feed("http://www.toptradersunplugged.com/feed/podcast", [@ben, @administrators])
    add_users_to_show_by_feed("https://terricole.libsyn.com/theterricoleshow", [@sylvia, @administrators])
    add_users_to_show_by_feed("https://ianrobinson.net/category/question-mark/feed", [@matt, @administrators])
    add_users_to_show_by_feed("https://alibrown.com/category/glambition/feed", [@ali, @nomes, @administrators])
    add_users_to_show_by_feed("http://feeds.soundcloud.com/users/soundcloud:users:171934475/sounds.rss", [@matt, @administrators])
    # add_users_to_show_by_feed("https://advancedmanufacturing.org/feed/podcast/", [@ben, @administrators])
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
      new_feed = Feed::SaveShowService.new(show)
      new_feed.perform
    end
  end

  desc "Generate invoices for all producers to be filled out"
  task generate_new_round_of_monthly_invoices: :environment do
    @administrators = User.where(role: "administrator")
    @producers = User.where(role: "producer")
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

  def client_podcast_RSS_feeds
    [
      "https://alibrown.com/category/glambition/feed",
      "https://ianrobinson.net/category/question-mark/feed",
      "http://kongitfarrell.libsyn.com/rss",
      "http://feeds.soundcloud.com/users/soundcloud:users:171934475/sounds.rss",
      "http://alexshalman.libsyn.com/rss",
      "http://voices4ed.libsyn.com/rss",
      "http://readysetlove.libsyn.com/rss",
      "https://firstbutlast.libsyn.com/rss",
      "https://letstalkhemp.libsyn.com/rss",
      "http://beautybiz.libsyn.com/rss",
      "http://moneytwist.libsyn.com/rss",
      "http://shesgotmoxie.libsyn.com/rss",
      "http://karagoldin.libsyn.com/rss",
      "https://terricole.libsyn.com/theterricoleshow",
      "http://baethdavis.libsyn.com/rss",
      "http://conversationswith.libsyn.com/rss",
      "http://businessmiracles.libsyn.com/rss",
      "http://drsteven.libsyn.com/rss",
      "https://nionlife.com/feed/podcast/",
      "http://www.asianefficiency.com/feed/podcast/",
      # "https://advancedmanufacturing.org/feed/podcast",
      "http://leadershipandbusiness.libsyn.com/rss",
      "http://neuronfire.libsyn.com/neuronfire",
      "http://www.toptradersunplugged.com/feed/podcast"
    ]
  end
end
