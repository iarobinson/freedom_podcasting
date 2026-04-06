require "rails_helper"

RSpec.describe "Api::V1::Wordpress::Uploads", type: :request do
  let(:user)        { create(:user) }
  let(:org)         { create(:organization) }
  let!(:membership) { create(:membership, user: user, organization: org, role: "owner") }
  let!(:podcast)    { create(:podcast, organization: org) }

  let(:pat_headers) do
    _, plaintext = PersonalAccessToken.generate_for(user: user, organization: org, name: "WP Test")
    { "Authorization" => "Bearer #{plaintext}" }
  end

  let(:presign_path) { "/api/v1/wordpress/podcasts/#{podcast.id}/uploads/presign" }
  let(:complete_path) { "/api/v1/wordpress/podcasts/#{podcast.id}/uploads/complete" }

  describe "POST /api/v1/wordpress/podcasts/:podcast_id/uploads/presign" do
    let(:valid_params) { { filename: "episode.mp3", content_type: "audio/mpeg" } }

    before do
      allow_any_instance_of(StorageService).to receive(:presigned_upload_url).and_return("https://r2.example.com/presigned")
    end

    it "returns a presigned URL and media_file_id" do
      post presign_path, params: valid_params, headers: pat_headers, as: :json

      expect(response).to have_http_status(:ok)
      data = response.parsed_body["data"]
      expect(data["presigned_url"]).to eq("https://r2.example.com/presigned")
      expect(data["media_file_id"]).to be_present
      expect(data["r2_key"]).to be_present
      expect(data["expires_in"]).to eq(3600)
    end

    it "creates a MediaFile record in pending state" do
      expect {
        post presign_path, params: valid_params, headers: pat_headers, as: :json
      }.to change(MediaFile, :count).by(1)

      mf = MediaFile.last
      expect(mf.processing_status).to eq("pending")
      expect(mf.podcast).to eq(podcast)
      expect(mf.organization).to eq(org)
    end

    it "rejects disallowed content types" do
      post presign_path,
           params: { filename: "malware.exe", content_type: "application/octet-stream" },
           headers: pat_headers, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["error"]).to match(/not allowed/)
    end

    it "returns 404 for a podcast from another org" do
      other_org     = create(:organization)
      other_podcast = create(:podcast, organization: other_org)

      post "/api/v1/wordpress/podcasts/#{other_podcast.id}/uploads/presign",
           params: valid_params, headers: pat_headers, as: :json

      expect(response).to have_http_status(:not_found)
    end

    it "returns 401 without a PAT" do
      post presign_path, params: valid_params, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "POST /api/v1/wordpress/podcasts/:podcast_id/uploads/complete" do
    let!(:media_file) do
      create(:media_file, organization: org, podcast: podcast, processing_status: "pending")
    end

    it "marks the media file as processing and enqueues ProcessAudioJob" do
      expect(ProcessAudioJob).to receive(:perform_later).with(media_file.id)

      post complete_path,
           params: { media_file_id: media_file.id, file_size: 12_345_678 },
           headers: pat_headers, as: :json

      expect(response).to have_http_status(:ok)
      data = response.parsed_body["data"]
      expect(data["media_file_id"]).to eq(media_file.id)
      expect(data["processing_status"]).to eq("processing")
      expect(media_file.reload.processing_status).to eq("processing")
      expect(media_file.reload.file_size).to eq(12_345_678)
    end

    it "does NOT enqueue AI pipeline jobs" do
      expect(TranscribeEpisodeJob).not_to receive(:perform_later) if defined?(TranscribeEpisodeJob)

      post complete_path,
           params: { media_file_id: media_file.id },
           headers: pat_headers, as: :json

      expect(response).to have_http_status(:ok)
    end

    it "returns 404 for a media_file from another org" do
      other_org  = create(:organization)
      other_mf   = create(:media_file, organization: other_org, podcast: create(:podcast, organization: other_org))

      post complete_path,
           params: { media_file_id: other_mf.id },
           headers: pat_headers, as: :json

      expect(response).to have_http_status(:not_found)
    end

    it "returns 401 without a PAT" do
      post complete_path, params: { media_file_id: media_file.id }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
