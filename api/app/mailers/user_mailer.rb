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
end
