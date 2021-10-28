Feature: Can shows be created and have episodes
  Given Cindy is a client

  Scenario: The one where a show can be created
    When Cindy starts a show
    Then The show should exist
