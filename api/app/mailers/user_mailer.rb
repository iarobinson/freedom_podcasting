class UserMailer < ApplicationMailer
  def verification_email(user)
    @user        = user
    @confirm_url = "#{ENV.fetch('FRONTEND_URL')}/auth/verify-email?token=#{user.confirmation_token}"
    mail(to: @user.email, subject: "Confirm your FreedomPodcasting email")
  end
end
