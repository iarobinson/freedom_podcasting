When "{word} starts a show" do |client_handle|
  visit new_show_path
  show_title_field = find_field("show_title")
  show_title_field.fill_in(with: "Cucumber Driven Test Podcast")
  click_button(start_a_new_show_button)
end

Then "The show should exist" do
  @show.nil? == false
end

When('{word} publishes an episode') do |client_handle|
  binding.pry
end

Then('a valid podcast RSS feed should be published') do
  binding.pry
end

# Method to complete sign-in/sign-up process
def sign_in_or_sign_up(email, password)
  email_field = find_field('Email')  # Use the correct field locator (ID, name, etc.)
  email_field.fill_in(with: email)
  password_field = find_field('user_password')  # Use the correct field locator
  password_field_confirmation = find_field('user_password_confirmation')  # Use the correct field locator
  password_field.fill_in(with: password)
  password_field_confirmation.fill_in(with: password)
  click_button('Sign up')  # Adjust the button name depending on the flow
end
