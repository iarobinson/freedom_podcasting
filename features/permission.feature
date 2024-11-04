Feature: Podcasts should only be altered by show owner

  Scenario: The one where a user tries to edit another users show
    Given Cindy has started a show
    And Sally has an account
    When Sally tries to edit Cindy's show
    Then Sally should not see controls to edit

  Scenario: The one where a user tries to edit another users episode
    Given Cindy has started a show
    And Sally has an account
    When Sally tries to edit Cindy's episode
    Then Sally should not see controls to edit