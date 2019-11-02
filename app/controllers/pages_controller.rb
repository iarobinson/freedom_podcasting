class PagesController < ApplicationController

  def home
    if current_user.nil?
      # Nothing data...
    elsif current_user.administrator?
      @users = User.all
    elsif current_user.producer?
      @shows = current_user.shows
    elsif current_user.client?
      # Client data
    elsif current_user.stranger?
      @show = Show.new
      # Stranger data
    end
  end

  def tools
    @result_url = Itunes::ShowLookupService.new("google.com")
    @result_url.perform
    @result_url
  end

  def feed_flipper
  end
end
