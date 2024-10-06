Given "{word} has started a show" do |client_handle|
  visit new_user_registration_path
  email = "#{client_handle.downcase}_the_cucumber@testing.com"
  password = "PASSWORD#{client_handle.downcase}"
  email_field = find_field('Email')
  email_field.fill_in(with: email)
  password_field = find_field('user_password')
  password_field_confirmation = find_field('user_password_confirmation')
  password_field.fill_in(with: password)
  password_field_confirmation.fill_in(with: password)
  click_button('Sign up')
  click_on("Start a New Podcast")
  show_title_field = find_field("show_title", disabled: false)
  show_title_field.fill_in(with: "Cucumber Driven Test Podcast")
  show_host_field = find_field("show_host", disabled: false)
  show_host_field.fill_in(with: "Cindy the Cucumber Tester")
  click_button("Create Show")
  navigate_to_publish_episode_link = find_link("Publish a New Episode")
  navigate_to_publish_episode_link.click
  episode_title_field = find_field("episode_title", disabled: false)
  episode_title_field.fill_in(with: "01 - Cucumber Tester Podcast")
  episode_description_field = find_field("episode_description", disabled: false)
  episode_description_field.fill_in(with: "This is the first cucumber episode that has been created in the testing phase")
  attach_file('new_episode_media_url_input', Rails.root.join('test/fixtures/files/dummy.mp3'))
  click_button 'Save Changes'
end

Then "The show should exist" do
  assert Show.count > 0
end

