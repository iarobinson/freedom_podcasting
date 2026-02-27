require "active_support/core_ext/integer/time"

Rails.application.configure do
  config.enable_reloading = false
  config.eager_load = true
  config.consider_all_requests_local = false
  config.cache_store = :memory_store
  config.active_support.report_deprecations = false
  config.active_record.dump_schema_after_migration = false
  config.log_level = :info
  config.log_tags = [:request_id]
  config.force_ssl = true
  config.action_mailer.delivery_method = :smtp
  config.action_mailer.smtp_settings = {
    address:              "smtp.resend.com",
    port:                 587,
    user_name:            "resend",
    password:             ENV.fetch("SMTP_PASSWORD"),
    authentication:       :plain,
    enable_starttls_auto: true
  }
  config.action_mailer.default_url_options = { host: ENV.fetch("FRONTEND_URL", "https://app.freedompodcasting.com") }
end
