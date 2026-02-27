class CustomDeviseMailer < Devise::Mailer
  def reset_password_instructions(record, token, opts = {})
    @token = token
    @resource = record
    frontend = ENV.fetch("FRONTEND_URL", "http://localhost:3001")
    @reset_url = "#{frontend}/auth/reset-password?reset_password_token=#{token}"
    devise_mail(record, :reset_password_instructions, opts)
  end
end
