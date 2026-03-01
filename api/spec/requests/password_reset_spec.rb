require "rails_helper"

RSpec.describe "Password Reset", type: :request do
  let(:user) { create(:user) }

  before { ActionMailer::Base.deliveries.clear }

  describe "POST /api/v1/auth/password" do
    context "with a registered email" do
      it "returns 200" do
        post "/api/v1/auth/password", params: { email: user.email }, as: :json
        expect(response).to have_http_status(:ok)
      end

      it "returns the generic confirmation message" do
        post "/api/v1/auth/password", params: { email: user.email }, as: :json
        expect(response.parsed_body["message"]).to include("If that email is registered")
      end

      it "sends a reset password email to the user" do
        post "/api/v1/auth/password", params: { email: user.email }, as: :json
        expect(ActionMailer::Base.deliveries.count).to eq(1)
        expect(ActionMailer::Base.deliveries.first.to).to include(user.email)
      end
    end

    context "with an unregistered email" do
      it "returns 200 to prevent email enumeration" do
        post "/api/v1/auth/password", params: { email: "nobody@example.com" }, as: :json
        expect(response).to have_http_status(:ok)
      end

      it "does not send any email" do
        post "/api/v1/auth/password", params: { email: "nobody@example.com" }, as: :json
        expect(ActionMailer::Base.deliveries).to be_empty
      end
    end
  end

  describe "PUT /api/v1/auth/password" do
    def generate_reset_token(user, sent_at: Time.current)
      raw, hashed = Devise.token_generator.generate(User, :reset_password_token)
      user.update!(reset_password_token: hashed, reset_password_sent_at: sent_at)
      raw
    end

    context "with a valid token and matching passwords" do
      it "returns 200" do
        token = generate_reset_token(user)
        put "/api/v1/auth/password", params: {
          reset_password_token: token,
          password: "NewPassword456!",
          password_confirmation: "NewPassword456!"
        }, as: :json
        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["message"]).to include("Password updated")
      end

      it "actually changes the user password" do
        token = generate_reset_token(user)
        put "/api/v1/auth/password", params: {
          reset_password_token: token,
          password: "NewPassword456!",
          password_confirmation: "NewPassword456!"
        }, as: :json
        expect(user.reload.valid_password?("NewPassword456!")).to be true
      end
    end

    context "with an invalid token" do
      it "returns 422" do
        put "/api/v1/auth/password", params: {
          reset_password_token: "not-a-real-token",
          password: "NewPassword456!",
          password_confirmation: "NewPassword456!"
        }, as: :json
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "with mismatched passwords" do
      it "returns 422" do
        token = generate_reset_token(user)
        put "/api/v1/auth/password", params: {
          reset_password_token: token,
          password: "NewPassword456!",
          password_confirmation: "DifferentPassword789!"
        }, as: :json
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "with an expired token" do
      around do |example|
        original = Devise.reset_password_within
        Devise.reset_password_within = 1.minute
        example.run
        Devise.reset_password_within = original
      end

      it "returns 422" do
        token = generate_reset_token(user, sent_at: 2.minutes.ago)
        put "/api/v1/auth/password", params: {
          reset_password_token: token,
          password: "NewPassword456!",
          password_confirmation: "NewPassword456!"
        }, as: :json
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end
end
