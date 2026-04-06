require "rails_helper"

RSpec.describe "Api::V1::Wordpress::Me", type: :request do
  let(:user)         { create(:user) }
  let(:org)          { create(:organization) }
  let!(:membership)  { create(:membership, user: user, organization: org, role: "owner") }
  let!(:podcast)     { create(:podcast, organization: org) }

  let(:pat_headers) do
    _, plaintext = PersonalAccessToken.generate_for(user: user, organization: org, name: "WP Test")
    { "Authorization" => "Bearer #{plaintext}" }
  end

  describe "GET /api/v1/wordpress/me" do
    it "returns user, org, and podcasts" do
      get "/api/v1/wordpress/me", headers: pat_headers, as: :json

      expect(response).to have_http_status(:ok)
      data = response.parsed_body["data"]
      expect(data["user"]["email"]).to eq(user.email)
      expect(data["organization"]["slug"]).to eq(org.slug)
      expect(data["podcasts"].length).to eq(1)
      expect(data["podcasts"].first["id"]).to eq(podcast.id)
    end

    it "returns 401 with no token" do
      get "/api/v1/wordpress/me", as: :json
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns 401 with a revoked token" do
      pat, plaintext = PersonalAccessToken.generate_for(user: user, organization: org, name: "WP")
      pat.revoke!
      get "/api/v1/wordpress/me", headers: { "Authorization" => "Bearer #{plaintext}" }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns 401 with a Devise JWT (not a PAT)" do
      post "/api/v1/auth/login", params: { user: { email: user.email, password: "Password123!" } }, as: :json
      jwt_headers = { "Authorization" => response.headers["Authorization"] }
      get "/api/v1/wordpress/me", headers: jwt_headers, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
