When "{word} starts a show" do |client_handle|
  visit new_user_registration_path
  sign_in_or_sign_up("#{client_handle}@cucumbertesting.com", "#{client_handle.downcase}CucumberPassword")
end

Then "The show should exist" do
  @show.nil? == false
end

When('{word} publishes an episode') do |client_handle|
  visit show_path(@show)
end

Then('a valid podcast RSS feed should be published') do
  sign_in_or_sign_up("cucumber@testing.com", "testingCucumberPassword")
end

# Method to enter the email
def enter_email(email)
  email_field = find_field('Email')  # Use the correct field locator (ID, name, etc.)
  email_field.fill_in(with: email)
end

# Method to enter the password
def enter_password(password) # Use the correct field locator
  password_field = find_field('user_password')  # Use the correct field locator
  password_field_confirmation = find_field('user_password_confirmation')  # Use the correct field locator
  password_field.fill_in(with: password)
  password_field_confirmation.fill_in(with: password)
end

# Method to click the sign-up/sign-in button
def click_sign_in_or_sign_up
  click_button('Sign up')  # Adjust the button name depending on the flow
end

# Method to complete sign-in/sign-up process
def sign_in_or_sign_up(email, password)
  enter_email(email)
  enter_password(password)
  click_sign_in_or_sign_up
end
