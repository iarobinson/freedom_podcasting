ENV["RAILS_ENV"] = "test"
require File.expand_path("../../config/environment", __FILE__)

require "rails/test_help"
require 'capybara/rails'
require 'capybara/rspec'

class ActiveSupport::TestCase
  # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
  fixtures :all
end

RSpec.configure do |config|
 config.include Capybara::DSL
end
