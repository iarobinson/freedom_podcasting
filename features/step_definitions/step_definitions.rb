Given "{word} starts a show" do |client_handle|
  @client = User.new(role: "client", first_name: client_handle)
  @show = Show.new
  @show.users << @client
end

Then "The show should exist" do
  @show.nil? == false
end

When "{word} publishes an episode" do |client_handle|
  @episode = Episode.new
  @show.episodes << @episode
end

When "{word}'s podcast RSS feed should be valid" do |client_handle|
  @show.podcast_rss_feed_url.valid?
end
