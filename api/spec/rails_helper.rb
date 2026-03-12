require "spec_helper"
ENV["RAILS_ENV"] = "test"
require_relative "../config/environment"
require "rspec/rails"
require "shoulda/matchers"
require "factory_bot_rails"
require "database_cleaner/active_record"

Dir[Rails.root.join("spec/support/**/*.rb")].sort.each { |f| require f }

DatabaseCleaner.strategy = :truncation

RSpec.configure do |config|
  config.use_transactional_fixtures = false
  config.include FactoryBot::Syntax::Methods
  config.include RequestHelpers, type: :request
  config.infer_spec_type_from_file_location!
  config.filter_rails_from_backtrace!

  config.before(:each) { DatabaseCleaner.start }
  config.after(:each)  { DatabaseCleaner.clean }
end

Shoulda::Matchers.configure do |config|
  config.integrate { |with| with.test_framework :rspec; with.library :rails }
end
