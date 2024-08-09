Feature: Users can make valid, publishable audio podcast RSS feeds

  Scenario: A new user creates a show and publishs an episode
    Given Sally starts a show
    When Sally publishes an episode
    Then Sally's podcast RSS feed should be valid
