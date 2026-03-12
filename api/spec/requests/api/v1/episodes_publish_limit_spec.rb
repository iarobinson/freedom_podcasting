require "rails_helper"

# Critical business rule: free plan = 1 published episode per calendar month;
# starter and above have no monthly cap (-1 limit in PLAN_LIMITS).
RSpec.describe "Episode publish limit", type: :request do
  let(:user)    { create(:user) }
  let(:org)     { create(:organization, plan: plan) }
  let!(:_mbr)   { create(:membership, user: user, organization: org, role: "owner") }
  let(:podcast) { create(:podcast, organization: org, published: true) }
  let(:headers) { auth_headers_for(user) }

  let(:audio_episode) do
    create(:episode, :published, podcast: podcast,
      status: "draft", published_at: nil)
  end

  def publish(ep)
    post "/api/v1/organizations/#{org.slug}/podcasts/#{podcast.slug}/episodes/#{ep.id}/publish",
         headers: headers
  end

  context "free plan (1 episode / month)" do
    let(:plan) { "free" }

    it "allows publishing when no episodes have been published this month" do
      publish(audio_episode)
      expect(response).to have_http_status(:ok)
    end

    it "blocks publishing a second episode in the same calendar month" do
      # First episode already published this month
      create(:episode, :published, podcast: podcast,
             published_at: Time.current.beginning_of_month + 1.hour)

      publish(audio_episode)
      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["error"]).to match(/monthly publish limit/i)
    end

    it "allows publishing again in a new calendar month" do
      # Publish limit only counts the CURRENT month
      create(:episode, :published, podcast: podcast,
             published_at: 1.month.ago.beginning_of_month + 1.hour)

      publish(audio_episode)
      expect(response).to have_http_status(:ok)
    end
  end

  context "starter plan (unlimited episodes / month)" do
    let(:plan) { "starter" }

    it "allows publishing multiple episodes in the same month" do
      # 5 already published this month — no cap for starter+
      5.times do
        create(:episode, :published, podcast: podcast,
               published_at: Time.current.beginning_of_month + 1.hour)
      end

      publish(audio_episode)
      expect(response).to have_http_status(:ok)
    end
  end

  context "pro plan (unlimited episodes / month)" do
    let(:plan) { "pro" }

    it "allows publishing without restriction" do
      10.times do
        create(:episode, :published, podcast: podcast,
               published_at: Time.current.beginning_of_month + 1.hour)
      end

      publish(audio_episode)
      expect(response).to have_http_status(:ok)
    end
  end
end
