require "rails_helper"

RSpec.describe "Api::V1::Wordpress::Podcasts", type: :request do
  let(:user)        { create(:user) }
  let(:org)         { create(:organization) }
  let!(:membership) { create(:membership, user: user, organization: org, role: "owner") }

  let(:pat_headers) do
    _, plaintext = PersonalAccessToken.generate_for(user: user, organization: org, name: "WP Test")
    { "Authorization" => "Bearer #{plaintext}" }
  end

  describe "POST /api/v1/wordpress/podcasts" do
    let(:valid_params) do
      {
        title:        "My WordPress Podcast",
        description:  "A podcast from WordPress",
        author:       "Test Author",
        email:        "podcast@example.com",
        language:     "en",
        podcast_type: "episodic"
      }
    end

    it "creates a new podcast and returns it" do
      post "/api/v1/wordpress/podcasts", params: valid_params, headers: pat_headers, as: :json

      expect(response).to have_http_status(:created)
      data = response.parsed_body["data"]
      expect(data["title"]).to eq("My WordPress Podcast")
      expect(data["slug"]).to be_present
      expect(data["id"]).to be_present
      expect(Podcast.count).to eq(1)
    end

    it "auto-generates a slug from title" do
      post "/api/v1/wordpress/podcasts", params: valid_params, headers: pat_headers, as: :json

      data = response.parsed_body["data"]
      expect(data["slug"]).to eq("my-wordpress-podcast")
    end

    it "deduplicates slugs when a collision exists" do
      create(:podcast, organization: org, slug: "my-wordpress-podcast")

      post "/api/v1/wordpress/podcasts", params: valid_params, headers: pat_headers, as: :json

      data = response.parsed_body["data"]
      expect(data["slug"]).to eq("my-wordpress-podcast-1")
    end

    it "uses fp_podcast_id to update an existing podcast" do
      existing = create(:podcast, organization: org, title: "Old Title")

      post "/api/v1/wordpress/podcasts",
           params: valid_params.merge(fp_podcast_id: existing.id),
           headers: pat_headers, as: :json

      expect(response).to have_http_status(:created)
      expect(existing.reload.title).to eq("My WordPress Podcast")
      expect(Podcast.count).to eq(1)
    end

    it "returns 404 when fp_podcast_id doesn't belong to this org" do
      other_org = create(:organization)
      other_podcast = create(:podcast, organization: other_org)

      post "/api/v1/wordpress/podcasts",
           params: valid_params.merge(fp_podcast_id: other_podcast.id),
           headers: pat_headers, as: :json

      expect(response).to have_http_status(:not_found)
    end

    it "returns 401 without a PAT" do
      post "/api/v1/wordpress/podcasts", params: valid_params, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "PATCH /api/v1/wordpress/podcasts/:id" do
    let!(:podcast) { create(:podcast, organization: org, title: "Original Title") }

    it "updates the podcast" do
      patch "/api/v1/wordpress/podcasts/#{podcast.id}",
            params: { title: "Updated Title" },
            headers: pat_headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.dig("data", "title")).to eq("Updated Title")
      expect(podcast.reload.title).to eq("Updated Title")
    end

    it "returns 404 for a podcast from another org" do
      other_org     = create(:organization)
      other_podcast = create(:podcast, organization: other_org)

      patch "/api/v1/wordpress/podcasts/#{other_podcast.id}",
            params: { title: "Hacked" },
            headers: pat_headers, as: :json

      expect(response).to have_http_status(:not_found)
    end

    it "returns 401 without a PAT" do
      patch "/api/v1/wordpress/podcasts/#{podcast.id}", params: { title: "Hacked" }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
