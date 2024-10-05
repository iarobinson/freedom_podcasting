Feature: Can shows be created and have episodes

  Scenario: The one where a show can be created
    When Cindy starts a show
    Then The show should exist

  Scenario: A user can sign up publish and episode and will have a valid podcast RSS feed
    Given Cindy starts a show
    When Cindy publishes an episode 
    Then a valid podcast RSS feed should be published