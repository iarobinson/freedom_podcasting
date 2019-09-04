require 'test_helper'

class PagesControllerTest < ActionDispatch::IntegrationTest
  include AuthenticationHelper

  setup do
    @page = pages(:one)
    @ian = users(:administrator_ian)
    # authenticate(@ian)
  end

  test "root url is visible" do
    get root_url
    assert_response :success
  end
end
