When "{word} starts a show" do |client_handle|
  @client = User.new(role: "client", first_name: client_handle)
  @show = Show.new
  @show.users << @client
end

Then "The show should exist" do
  @show.nil? == false
end
