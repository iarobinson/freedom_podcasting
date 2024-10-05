# [Freedom Podcasting Application](http://app.freedompodcasting.com)

Opensource Podcast Production Software


## Testing

### Behaviro Driven Development

We use Selenium webdriver to run the BDD tests.

`brew install chromedriver`

You can run the cucumber tests with the folloiwing command:

`cucumber test`

I use Homebrew to setup my chromedriver to the following path:

`/opt/homebrew/bin/chromedriver`

If you have chromedriver in a different location, you'll need to update that path in rails_helper.rb

To find your chrome browser version, go to to chrome and navigate in the URL:

`chrome://settings/help`

Make sure this version matches the one in rails_helper.rb

### Standard Rails Testing

We utilize startd Rails testing practices for unit tests:

`rails test`