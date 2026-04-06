require "rails_helper"

RSpec.describe "Api::V1::Wordpress::Tokens", type: :request do
  let(:user) { create(:user) }
  let(:org)  { create(:organization) }
  let!(:membership) { create(:membership, user: user, organization: org, role: "owner") }

  let(:auth_headers) do
    post "/api/v1/auth/login", params: { user: { email: user.email, password: "Password123!" } }, as: :json
    { "Authorization" => response.headers["Authorization"] }
  end

  let(:base_path) { "/api/v1/wordpress/organizations/#{org.slug}/tokens" }

  describe "POST /api/v1/wordpress/organizations/:org/tokens" do
    it "creates a PAT and returns the plaintext token once" do
      post base_path, params: { name: "WordPress - test.com", callback_url: "https://test.com/wp-admin" }, headers: auth_headers, as: :json

      expect(response).to have_http_status(:created)
      json = response.parsed_body
      expect(json.dig("data", "token")).to start_with("fp_pat_")
      expect(json.dig("data", "name")).to eq("WordPress - test.com")
      expect(json.dig("data", "organization", "slug")).to eq(org.slug)
      expect(PersonalAccessToken.count).to eq(1)
    end

    it "uses a default name when none provided" do
      post base_path, params: { callback_url: "https://test.com/wp-admin" }, headers: auth_headers, as: :json

      expect(response).to have_http_status(:created)
      expect(response.parsed_body.dig("data", "name")).to eq("WordPress")
    end

    it "rejects a non-HTTPS callback_url" do
      post base_path, params: { callback_url: "http://test.com/wp-admin" }, headers: auth_headers, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["error"]).to match(/HTTPS/)
    end

    it "returns 401 without auth header" do
      post base_path, params: { callback_url: "https://test.com/wp-admin" }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns 403 for viewer role" do
      viewer = create(:user)
      create(:membership, user: viewer, organization: org, role: "viewer")
      post "/api/v1/auth/login", params: { user: { email: viewer.email, password: "Password123!" } }, as: :json
      viewer_headers = { "Authorization" => response.headers["Authorization"] }

      post base_path, params: { callback_url: "https://test.com/wp-admin" }, headers: viewer_headers, as: :json
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "GET /api/v1/wordpress/organizations/:org/tokens" do
    it "lists active tokens without exposing plaintext" do
      create(:personal_access_token, user: user, organization: org, name: "WP Token 1")
      create(:personal_access_token, user: user, organization: org, name: "WP Token 2")

      get base_path, headers: auth_headers, as: :json

      expect(response).to have_http_status(:ok)
      tokens = response.parsed_body["data"]
      expect(tokens.length).to eq(2)
      tokens.each do |t|
        expect(t["token"]).to be_nil  # never expose plaintext in list
        expect(t["prefix"]).to start_with("fp_pat_")
        expect(t["name"]).to be_present
      end
    end

    it "does not include revoked tokens" do
      active  = create(:personal_access_token, user: user, organization: org)
      revoked = create(:personal_access_token, user: user, organization: org)
      revoked.revoke!

      get base_path, headers: auth_headers, as: :json

      ids = response.parsed_body["data"].map { |t| t["id"] }
      expect(ids).to include(active.id)
      expect(ids).not_to include(revoked.id)
    end
  end

  describe "DELETE /api/v1/wordpress/organizations/:org/tokens/:id" do
    it "revokes the token" do
      pat = create(:personal_access_token, user: user, organization: org)

      delete "#{base_path}/#{pat.id}", headers: auth_headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(pat.reload.revoked_at).not_to be_nil
    end

    it "returns 404 for a token belonging to another user" do
      other = create(:user)
      other_pat = create(:personal_access_token, user: other, organization: org)

      delete "#{base_path}/#{other_pat.id}", headers: auth_headers, as: :json
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "PersonalAccessToken.authenticate" do
    it "returns the record for a valid token" do
      pat, plaintext = PersonalAccessToken.generate_for(user: user, organization: org, name: "Test")
      result = PersonalAccessToken.authenticate(plaintext)
      expect(result).to eq(pat)
    end

    it "returns nil for a garbage token" do
      expect(PersonalAccessToken.authenticate("fp_pat_notreal")).to be_nil
    end

    it "returns nil for a revoked token" do
      pat, plaintext = PersonalAccessToken.generate_for(user: user, organization: org, name: "Test")
      pat.revoke!
      expect(PersonalAccessToken.authenticate(plaintext)).to be_nil
    end

    it "touches last_used_at on successful auth" do
      pat, plaintext = PersonalAccessToken.generate_for(user: user, organization: org, name: "Test")
      expect { PersonalAccessToken.authenticate(plaintext) }.to change { pat.reload.last_used_at }
    end
  end
end
