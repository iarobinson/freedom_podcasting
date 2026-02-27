Devise.setup do |config|
  config.mailer_sender = ENV.fetch("MAILER_FROM", "noreply@freedompodcasting.com")
  config.mailer = "CustomDeviseMailer"

  require "devise/orm/active_record"

  config.case_insensitive_keys  = [:email]
  config.strip_whitespace_keys  = [:email]
  config.skip_session_storage   = [:http_auth, :token_auth, :params_auth]
  config.stretches              = Rails.env.test? ? 1 : 12
  config.reconfirmable          = false
  config.password_length        = 8..128
  config.email_regexp           = /\A[^@\s]+@[^@\s]+\z/
  config.reset_password_within  = 6.hours
  config.sign_out_via           = :delete
  config.navigational_formats   = []

  config.jwt do |jwt|
    jwt.secret = ENV.fetch("DEVISE_JWT_SECRET_KEY", "dev-secret-please-change-in-production-make-it-long")
    jwt.dispatch_requests = [
      ["POST", %r{^/api/v1/auth/login$}]
    ]
    jwt.revocation_requests = [
      ["DELETE", %r{^/api/v1/auth/logout$}]
    ]
    jwt.expiration_time = 24.hours.to_i
  end
end
