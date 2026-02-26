require_relative "boot"

require "rails"
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "active_storage/engine"
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_view/railtie"

Bundler.require(*Rails.groups)

module FreedomPodcastingApi
  class Application < Rails::Application
    config.load_defaults 7.1
    config.api_only = true
    config.time_zone = "UTC"
    config.active_job.queue_adapter = :sidekiq

    # Needed for Devise
    config.middleware.use ActionDispatch::Flash
    config.middleware.use ActionDispatch::Cookies
    config.middleware.use ActionDispatch::Session::CookieStore
  end
end
