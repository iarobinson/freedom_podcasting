ENV["RAILS_ENV"] = "test"
require File.expand_path("../../config/environment", __FILE__)

require "rails/test_help"
require 'capybara/rails'
require 'capybara/rspec'
p "Test helper loaded"

class ActiveSupport::TestCase
  # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
  fixtures :all
end

RSpec.configure do |config|
 # config.fixture_path = "#{::Rails.root}/spec/fixtures"
 # config.use_transactional_fixtures = true
 # config.infer_spec_type_from_file_location!
 config.include Capybara::DSL
end
