source "https://rubygems.org"
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby "3.3.0"

gem "rails", "~> 7.1"
gem "pg", "~> 1.5"
gem "puma", "~> 6.4"
gem "rack-cors"
gem "bootsnap", require: false

# Auth
gem "devise"
gem "devise-jwt"
gem "pundit"

# Serialization
gem "jsonapi-serializer"

# Background jobs
gem "sidekiq", "~> 7.2"
gem "sidekiq-scheduler"

# Storage (Cloudflare R2 is S3-compatible)
gem "aws-sdk-s3", "~> 1.148"

# Audio metadata
gem "streamio-ffmpeg"

# RSS / XML
gem "builder"

# HTTP client (for AI integrations later)
gem "faraday"
gem "faraday-retry"

# Pagination
gem "pagy"

# Misc
gem "dotenv-rails", groups: [:development, :test]
gem "tzinfo-data", platforms: %i[windows jruby]

group :development, :test do
  gem "rspec-rails", "~> 6.1"
  gem "factory_bot_rails"
  gem "faker"
  gem "shoulda-matchers"
  gem "database_cleaner-active_record"
  gem "rubocop-rails-omakase", require: false
end

group :development do
  gem "listen"
end
