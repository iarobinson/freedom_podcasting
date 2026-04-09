class UserMailer < ApplicationMailer
  def verification_email(user)
    @user        = user
    @confirm_url = "#{ENV.fetch('FRONTEND_URL')}/auth/verify-email?token=#{user.confirmation_token}"
    mail(to: @user.email, subject: "Confirm your FreedomPodcasting email")
  end

  def welcome(user)
    @user          = user
    @dashboard_url = "#{ENV.fetch('FRONTEND_URL')}/dashboard"
    mail(to: @user.email, subject: "Welcome to Freedom Podcasting")
  end

  def podcast_live(user, episode)
    frontend     = ENV.fetch("FRONTEND_URL", "https://app.freedompodcasting.com")
    @user        = user
    @episode     = episode
    @podcast     = episode.podcast
    @rss_url     = @podcast.rss_feed_url
    @episode_url = "#{frontend}/dashboard/podcasts/#{@podcast.slug}/episodes/#{@episode.id}/edit"
    @podcast_url = "#{frontend}/dashboard/podcasts/#{@podcast.slug}"
    mail(to: @user.email, subject: "Your podcast is live!")
  end
end
