When "{word} starts a show" do |client_handle|
  @client = User.new(role: "client", first_name: client_handle, email: "#{client_handle}@example.com", password: "super-secure-password")
  @show = Show.create(
    title: "Test Show",
    host: "Randal Robot",
    website: "http://example.com"
  )
  @show.users << @client
end

Then "The show should exist" do
  @show.nil? == false
end

When('{word} publishes an episode') do |client_handle|
  visit show_path(@show)
  binding.pry
end

Then('a valid podcast RSS feed should be published') do
  pending # Write code here that turns the phrase above into concrete actions
end