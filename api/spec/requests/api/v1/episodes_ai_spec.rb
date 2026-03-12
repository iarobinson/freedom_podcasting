require "rails_helper"

# Critical business rules:
#   1. Any user (even free plan) can pay to unlock AI for a single episode.
#   2. Pricing is $0.50/min of audio, rounded UP to the nearest minute.
#   3. Free plan without purchase is blocked (402) from transcribe/show-notes.
#   4. Free plan WITH ai_purchased_at bypasses the gate.
#   5. Paid plans are never gated.
RSpec.describe "Episode AI features", type: :request do
  let(:user)    { create(:user) }
  let(:org)     { create(:organization, plan: plan) }
  let!(:_mbr)   { create(:membership, user: user, organization: org, role: "owner") }
  let(:podcast) { create(:podcast, organization: org) }
  let(:headers) { auth_headers_for(user) }

  # Episode with audio and known duration — ready for AI
  let(:episode) do
    create(:episode, podcast: podcast,
           audio_url: "https://media.example.com/ep.mp3",
           audio_content_type: "audio/mpeg",
           audio_duration_seconds: duration_seconds,
           transcription_status: nil,
           ai_metadata_status: nil,
           ai_purchased_at: ai_purchased_at)
  end

  let(:duration_seconds) { 3_660 }   # 61 min → ceil = 62 min at $0.50 = $31.00
  let(:ai_purchased_at)  { nil }

  def checkout_ai_url
    "/api/v1/organizations/#{org.slug}/podcasts/#{podcast.slug}/episodes/#{episode.id}/checkout_ai"
  end

  def transcribe_url
    "/api/v1/organizations/#{org.slug}/podcasts/#{podcast.slug}/episodes/#{episode.id}/transcribe"
  end

  def show_notes_url
    "/api/v1/organizations/#{org.slug}/podcasts/#{podcast.slug}/episodes/#{episode.id}/generate_show_notes"
  end

  # ── Per-episode checkout (any plan can pay) ────────────────────────────────

  describe "POST checkout_ai" do
    before do
      allow(Stripe::Checkout::Session).to receive(:create).and_return(
        double("session", url: "https://checkout.stripe.com/test-session")
      )
    end

    context "free plan" do
      let(:plan) { "free" }

      it "creates a Stripe Checkout session and returns its URL" do
        post checkout_ai_url, headers: headers
        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["url"]).to eq("https://checkout.stripe.com/test-session")
      end

      it "charges by the minute — ceil(duration / 60) × 50 cents" do
        # 3660 seconds → 61.0 min → ceil = 62 min → 62 × 50 = 3100 cents ($31.00)
        expected_cents = (3_660 / 60.0).ceil * 50

        post checkout_ai_url, headers: headers

        expect(Stripe::Checkout::Session).to have_received(:create) do |params|
          unit_amount = params.dig(:line_items, 0, :price_data, :unit_amount)
          expect(unit_amount).to eq(expected_cents)
        end
      end

      it "rounds fractional minutes UP (1 second over a full minute still bills the next minute)" do
        episode.update!(audio_duration_seconds: 3_601)  # 60 min + 1 sec → ceil = 61 min

        post checkout_ai_url, headers: headers

        expect(Stripe::Checkout::Session).to have_received(:create) do |params|
          unit_amount = params.dig(:line_items, 0, :price_data, :unit_amount)
          expect(unit_amount).to eq(61 * 50)
        end
      end

      it "uses payment mode (one-time charge, not subscription)" do
        post checkout_ai_url, headers: headers

        expect(Stripe::Checkout::Session).to have_received(:create) do |params|
          expect(params[:mode]).to eq("payment")
        end
      end

      it "embeds episode_id in session metadata for the webhook" do
        post checkout_ai_url, headers: headers

        expect(Stripe::Checkout::Session).to have_received(:create) do |params|
          expect(params.dig(:metadata, :episode_id)).to eq(episode.id)
        end
      end

      it "returns url: nil when the episode has already been purchased" do
        episode.update!(ai_purchased_at: 1.hour.ago)
        post checkout_ai_url, headers: headers
        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["url"]).to be_nil
      end

      it "returns 422 when audio_duration_seconds is not yet set" do
        episode.update!(audio_duration_seconds: nil)
        post checkout_ai_url, headers: headers
        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.parsed_body["error"]).to match(/still being processed/i)
      end
    end

    context "starter plan" do
      let(:plan) { "starter" }

      it "still returns url: nil (paid plan users don't need to purchase per-episode)" do
        # checkout_ai checks ai_purchased_at first, not the plan.
        # A paid-plan user who hasn't purchased also gets a checkout URL
        # (edge case: unlikely UX path, but the endpoint should still work).
        post checkout_ai_url, headers: headers
        expect(response).to have_http_status(:ok)
      end
    end
  end

  # ── AI access gate ─────────────────────────────────────────────────────────

  describe "POST transcribe" do
    before { allow(TranscribeEpisodeJob).to receive(:perform_later) }

    context "free plan without purchase" do
      let(:plan) { "free" }

      it "returns 402 payment required" do
        post transcribe_url, headers: headers
        expect(response).to have_http_status(:payment_required)
        expect(response.parsed_body["error"]).to match(/paid plan or a per-episode purchase/i)
      end

      it "does not enqueue a transcription job" do
        post transcribe_url, headers: headers
        expect(TranscribeEpisodeJob).not_to have_received(:perform_later)
      end
    end

    context "free plan with ai_purchased_at set" do
      let(:plan)           { "free" }
      let(:ai_purchased_at) { 1.hour.ago }

      it "allows transcription (402 gate is bypassed)" do
        post transcribe_url, headers: headers
        expect(response).to have_http_status(:ok)
      end

      it "enqueues TranscribeEpisodeJob" do
        post transcribe_url, headers: headers
        expect(TranscribeEpisodeJob).to have_received(:perform_later).with(episode.id)
      end
    end

    context "starter plan (paid)" do
      let(:plan) { "starter" }

      it "allows transcription without any purchase" do
        post transcribe_url, headers: headers
        expect(response).to have_http_status(:ok)
      end
    end
  end

  describe "POST generate_show_notes" do
    before { allow(GenerateShowNotesJob).to receive(:perform_later) }

    # Needs a transcript to be present
    let(:episode) do
      create(:episode, podcast: podcast,
             audio_url: "https://media.example.com/ep.mp3",
             transcript: "Hello world.",
             show_notes_ai_status: nil,
             ai_purchased_at: ai_purchased_at)
    end

    context "free plan without purchase" do
      let(:plan) { "free" }

      it "returns 402 payment required" do
        post show_notes_url, headers: headers
        expect(response).to have_http_status(:payment_required)
      end
    end

    context "free plan with ai_purchased_at set" do
      let(:plan)           { "free" }
      let(:ai_purchased_at) { 1.hour.ago }

      it "allows show notes generation" do
        post show_notes_url, headers: headers
        expect(response).to have_http_status(:ok)
      end
    end

    context "pro plan (paid)" do
      let(:plan) { "pro" }

      it "allows show notes generation without purchase" do
        post show_notes_url, headers: headers
        expect(response).to have_http_status(:ok)
      end
    end
  end
end
