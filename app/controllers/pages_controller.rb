class PagesController < ApplicationController

  def home
    @shows = Show.all if current_user
  end

  def tools
    @result_url = Itunes::ShowLookupService.new("google.com")
    @result_url.perform
    @result_url
  end

  def feed_flipper
  end

  def random_episode
    @random_episode = Episode.sample;
  end

  def immediate_add
  end
end
