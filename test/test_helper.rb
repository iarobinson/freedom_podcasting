ENV["RAILS_ENV"] = "test"
require File.expand_path("../../config/environment", __FILE__)

require "rails/test_help"
# require "minitest/rails/capybara"
require "delorean"
require "mocha/minitest"

Capybara.register_driver :headless_chrome do |app|
  capabilities = Selenium::WebDriver::Remote::Capabilities.chrome(
    chromeOptions: { args: %w(headless disable-gpu) },
  )

  Capybara::Selenium::Driver.new(app, browser: :chrome, desired_capabilities: capabilities).tap do |driver|
    driver.browser.manage.window.size = Selenium::WebDriver::Dimension.new(1024, 768)
  end
end

Capybara.javascript_driver = :headless_chrome

Capybara.default_max_wait_time = 5

class ActiveSupport::TestCase
  # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
  fixtures :all

  # Add more helper methods to be used by all tests here...

  module AuthenticationHelper

    def authenticate(args)
      get new_user_session_path
      within("form#new_user") do
        fill_in("user_email", with: args[:email])
        fill_in("user_password", with: args[:password])
        click_button "Log in"
      end
    end
  end
end
