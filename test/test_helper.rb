ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'
require 'rails/test_help'

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
