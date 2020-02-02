require 'test_helper'
require "action_dispatch/testing/test_process"
require "spec_helper"

feature "PagesControllerTest" do
  include AuthenticationHelper
  setup do
    p 'Printing tests'
  end
end
class PagesControllerTest < ActionDispatch::IntegrationTest
  include AuthenticationHelper

  setup do
    @ian = User.where(email: "ian@testing.com").first
    # authenticate(@ian)
  end

  test "visit sign in screen" do
    visit root_path

    click_on "Sign In"

    assert_text "Login"
  end

  # feature "can visit home page" do
  #   scenario "has content" do
  #     visit root_path
  #     page.must_have_content "Podcast Production"
  #   end
  # end
end
