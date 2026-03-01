class CustomDeviseMailer < Devise::Mailer
  def reset_password_instructions(record, token, opts = {})
    @token = token
    @resource = record
    frontend = ENV.fetch("FRONTEND_URL", "http://localhost:3001")
    @reset_url = "#{frontend}/auth/reset-password?reset_password_token=#{token}"

    unless Rails.env.production?
      Rails.logger.info ""
      Rails.logger.info "=" * 60
      Rails.logger.info "[DEV] Password reset URL for #{record.email}:"
      Rails.logger.info @reset_url
      Rails.logger.info "=" * 60
      Rails.logger.info ""
    end

    devise_mail(record, :reset_password_instructions, opts)
  end
end
