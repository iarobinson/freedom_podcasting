source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '2.6.5'

gem 'whenever', require: false
gem 'feedjira'
gem 'httparty'
gem 'bootstrap'
gem 'jquery-rails'
gem 'simple_form'
gem 'popper_js'
gem 'tether-rails'
gem 'devise'
gem 'material_icons'
gem "webpacker"
# Added this gem to fix the error when launching rails c
gem 'rb-readline'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '6.0.0'
# Use postgres as the database for Active Record
gem 'pg'
# Use Puma as the app server
gem "puma", ">= 3.12.2"
# Use Amazon s3 for image, audio and video storage
gem "aws-sdk-s3", require: false
# Use SCSS for stylesheets
gem 'sass-rails', '~> 5.0'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'
# See https://github.com/rails/execjs#readme for more supported runtimes
# gem 'mini_racer', platforms: :ruby

# Use CoffeeScript for .coffee assets and views
gem 'coffee-rails', '~> 5.0.0'
# Turbolinks makes navigating your web application faster. Read more: https://github.com/turbolinks/turbolinks
gem 'turbolinks', '~> 5'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.9.1'
# Use Redis adapter to run Action Cable in production
# gem 'redis', '~> 4.0'
# Use ActiveModel has_secure_password
# gem 'bcrypt', '~> 3.1.7'

# Use ActiveStorage variant
# gem 'mini_magick', '~> 4.8'

# Use Capistrano for deployment
# gem 'capistrano-rails', group: :development

# Reduces boot times through caching; required in config/boot.rb
gem 'bootsnap', '>= 1.1.0', require: false

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', platforms: [:mri, :mingw, :x64_mingw]
  gem "webdrivers"
  gem "selenium-webdriver"
  gem "simplecov"
  gem 'listen', '>= 3.0.5', '< 3.2'
  gem 'spring'
  gem 'rspec-rails', '~> 4.0.0.beta'
  gem 'pry-rails'
  gem 'spring-watcher-listen', '~> 2.0.0'
  gem 'capybara'
  gem 'rubocop', require: false
end

group :development do
  gem 'web-console', '>= 3.3.0'
end
# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]
