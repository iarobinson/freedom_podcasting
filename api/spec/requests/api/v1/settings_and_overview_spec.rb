require "rails_helper"

RSpec.describe "Account/org settings and dashboard overview", type: :request do
  let(:owner)   { create(:user) }
  let(:org)     { create(:organization, plan: "free") }
  let!(:_mbr)   { create(:membership, user: owner, organization: org, role: "owner") }
  let(:headers) { auth_headers_for(owner) }

  it "updates the current user's name" do
    patch "/api/v1/auth/me", params: { user: { first_name: "Ada", last_name: "Lovelace" } }.to_json, headers: headers
    expect(response).to have_http_status(:ok)
    expect(response.parsed_body["data"]["full_name"]).to eq("Ada Lovelace")
  end

  it "lets a manager rename the organization but ignores slug changes" do
    old_slug = org.slug
    patch "/api/v1/organizations/#{org.slug}", params: { organization: { name: "New Name", slug: "hijack" } }.to_json, headers: headers
    expect(response).to have_http_status(:ok)
    expect(org.reload.name).to eq("New Name")
    expect(org.slug).to eq(old_slug)
  end

  it "forbids editors from renaming the organization" do
    editor = create(:user)
    create(:membership, user: editor, organization: org, role: "editor")
    patch "/api/v1/organizations/#{org.slug}", params: { organization: { name: "Nope" } }.to_json, headers: auth_headers_for(editor)
    expect(response).to have_http_status(:forbidden)
  end

  it "returns stats, setup facts, and activity" do
    podcast = create(:podcast, organization: org, artwork_url: nil)
    create(:episode, podcast: podcast)
    get "/api/v1/organizations/#{org.slug}/overview", headers: headers
    expect(response).to have_http_status(:ok)
    data = response.parsed_body["data"]
    expect(data["stats"]["podcasts"]).to eq(1)
    expect(data["stats"]["draft_episodes"]).to eq(1)
    expect(data["setup"]["missing_artwork_slug"]).to eq(podcast.slug)
    expect(data["setup"]["has_published"]).to be(false)
    expect(data["activity"].map { |a| a["kind"] }).to include("podcast_created", "episode_created")
  end
end
