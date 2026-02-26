require "rails_helper"

RSpec.describe "RSS Feed", type: :request do
  let(:org)     { create(:organization) }
  let(:podcast) { create(:podcast, organization: org, published: true, published_at: 1.day.ago) }
  let!(:episode1) { create(:episode, :published, podcast: podcast, episode_number: 1, title: "Episode One") }
  let!(:episode2) { create(:episode, :published, podcast: podcast, episode_number: 2, title: "Episode Two") }
  let!(:draft_episode) { create(:episode, podcast: podcast, status: "draft") }

  subject { get "/feeds/#{podcast.slug}", headers: { "Accept" => "application/xml" } }

  it "returns 200" do
    subject
    expect(response).to have_http_status(:ok)
  end

  it "returns XML content type" do
    subject
    expect(response.content_type).to include("application/rss+xml")
  end

  it "includes RSS 2.0 structure" do
    subject
    expect(response.body).to include('version="2.0"')
    expect(response.body).to include("xmlns:itunes")
  end

  it "includes podcast title and description" do
    subject
    expect(response.body).to include(podcast.title)
    expect(response.body).to include(podcast.description)
  end

  it "includes author and email in itunes:owner" do
    subject
    expect(response.body).to include(podcast.author)
    expect(response.body).to include(podcast.email)
  end

  it "includes only published episodes" do
    subject
    expect(response.body).to include("Episode One")
    expect(response.body).to include("Episode Two")
    expect(response.body).not_to include(draft_episode.title)
  end

  it "includes enclosure tags with audio URLs" do
    subject
    expect(response.body).to include("<enclosure")
    expect(response.body).to include(episode1.audio_url)
  end

  it "uses immutable GUIDs" do
    subject
    expect(response.body).to include(episode1.guid)
    expect(response.body).to include(episode2.guid)
  end

  it "includes itunes:duration for episodes with audio" do
    subject
    expect(response.body).to include("<itunes:duration>")
  end

  it "includes atom:link self reference" do
    subject
    expect(response.body).to include('rel="self"')
  end

  it "returns 404 for unpublished podcast" do
    podcast.update!(published: false)
    subject
    expect(response).to have_http_status(:not_found)
  end

  it "returns 404 for nonexistent podcast" do
    get "/feeds/nonexistent-podcast-slug"
    expect(response).to have_http_status(:not_found)
  end
end
