source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '3.3.0'

# gem 'whenever', require: false
# gem 'feedjira'
gem 'httparty'
gem 'bootstrap', '~> 5.3', '>= 5.3.2'
gem 'sassc-rails' # Required for bootstrap
gem 'jquery-rails'
gem 'simple_form'
gem 'devise'
gem "rails", "~> 7.1.3", ">= 7.1.3.4"

# Use postgres as the database for Active Record
gem 'pg'
gem "puma", ">= 5.0"
# Use Amazon s3 for image, audio and video storage
gem "aws-sdk-s3", require: false
gem 'image_processing', '~> 1.2'
# Use SCSS for stylesheets
# gem 'sass-rails', '~> 5.0'

# Turbolinks makes navigating your web application faster. Read more: https://github.com/turbolinks/turbolinks
gem 'turbo-rails'
gem 'stimulus-rails'
gem 'importmap-rails', '~> 1.0'

# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder'

gem 'bootsnap', '>= 1.1.0', require: false

# For generating RSS feeds
gem 'builder'

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', platforms: [:mri, :mingw, :x64_mingw]
  gem 'webdrivers', '~> 5.0', require: false
  gem "selenium-webdriver"
  gem "simplecov"
  gem 'spring'
  gem 'rspec-rails', '~> 4.0.0.beta'
  gem 'pry-rails'
  gem 'spring-watcher-listen', '~> 2.0.0'
  gem 'capybara'
  gem 'rubocop', require: false
  gem 'dotenv-rails'
end

group :test do
  gem 'cucumber-rails', '~> 3.0', require: false
  gem 'database_cleaner-active_record'
end

group :development do
  gem 'web-console', '>= 3.3.0'
end

gem "tzinfo-data", platforms: %i[ mswin mswin64 mingw x64_mingw jruby ]
