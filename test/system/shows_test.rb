require "application_system_test_case"

class ShowsTest < ApplicationSystemTestCase
  setup do
    @show = shows(:one)
  end

  test "visiting the index" do
    visit shows_url
    assert_selector "h1", text: "Shows"
  end

  test "creating a Show" do
    visit shows_url
    click_on "New Show"

    fill_in "Category", with: @show.category
    fill_in "Description", with: @show.description
    fill_in "Host", with: @show.host
    fill_in "Subtitle", with: @show.subtitle
    fill_in "Title", with: @show.title
    fill_in "Website", with: @show.website
    click_on "Create Show"

    assert_text "Show was successfully created"
    click_on "Back"
  end

  test "updating a Show" do
    visit shows_url
    click_on "Edit", match: :first

    fill_in "Category", with: @show.category
    fill_in "Description", with: @show.description
    fill_in "Host", with: @show.host
    fill_in "Subtitle", with: @show.subtitle
    fill_in "Title", with: @show.title
    fill_in "Website", with: @show.website
    click_on "Update Show"

    assert_text "Show was successfully updated"
    click_on "Back"
  end

  test "destroying a Show" do
    visit shows_url
    page.accept_confirm do
      click_on "Destroy", match: :first
    end

    assert_text "Show was successfully destroyed"
  end
end
