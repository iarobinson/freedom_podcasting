require "active_support/core_ext/integer/time"

Rails.application.configure do
  config.hosts.clear
  config.enable_reloading = false
  config.eager_load = false
  config.cache_store = :null_store
  config.action_dispatch.show_exceptions = :none
  config.action_controller.allow_forgery_protection = false
  config.active_support.deprecation = :stderr
  config.active_record.migration_error = :page_load
  config.action_mailer.delivery_method = :test
  config.action_mailer.perform_deliveries = true
end
