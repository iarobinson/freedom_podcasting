require 'test_helper'

class PagesControllerTest < ActionDispatch::IntegrationTest

  test "visit sign in screen" do
    get root_path

    assert_match(/[a-zA-Z]/,"kaboom", "MEssage here")
    assert_match(//, "asadfasdfasdf.")
  end
end
