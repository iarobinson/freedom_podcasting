require "application_system_test_case"

class PagesTest < Capybara::Rails::TestCase

  test "visiting the index" do
    visit root_path
    assert_selector "h1", text: "Podcast Production Services"
  end

  # test "creating a Page" do
  #   visit pages_url
  #   click_on "New Page"
  #
  #   fill_in "Heading", with: @page.heading
  #   fill_in "Title", with: @page.title
  #   click_on "Create Page"
  #
  #   assert_text "Page was successfully created"
  #   click_on "Back"
  # end
  #
  # test "updating a Page" do
  #   visit pages_url
  #   click_on "Edit", match: :first
  #
  #   fill_in "Heading", with: @page.heading
  #   fill_in "Title", with: @page.title
  #   click_on "Update Page"
  #
  #   assert_text "Page was successfully updated"
  #   click_on "Back"
  # end
  #
  # test "destroying a Page" do
  #   visit pages_url
  #   page.accept_confirm do
  #     click_on "Destroy", match: :first
  #   end
  #
  #   assert_text "Page was successfully destroyed"
  # end
end
