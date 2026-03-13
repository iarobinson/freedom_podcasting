class AdminMailer < ApplicationMailer
  ADMIN_EMAIL = "ian@freedompodcasting.com"

  def new_signup(user)
    @user = user
    mail(to: ADMIN_EMAIL, subject: "New signup: #{user.full_name} (#{user.email})")
  end
end
