module Api::V1
  class UploadsController < ApplicationController
    before_action :current_organization
    before_action :require_editor!

    ALLOWED_AUDIO  = %w[audio/mpeg audio/mp4 audio/ogg audio/wav audio/x-wav audio/flac].freeze
    ALLOWED_IMAGES = %w[image/jpeg image/png image/webp].freeze

    def presign
      filename, content_type = params.require([:filename, :content_type])
      upload_type = params.fetch(:upload_type, "audio")
      allowed = upload_type == "artwork" ? ALLOWED_IMAGES : ALLOWED_AUDIO
      return render(json: { error: "File type not allowed." }, status: :unprocessable_entity) unless allowed.include?(content_type)

      key = "organizations/#{current_organization.id}/#{upload_type}/#{SecureRandom.uuid}#{File.extname(filename).downcase}"
      url = StorageService.new.presigned_upload_url(key: key, content_type: content_type)
      mf  = current_organization.media_files.create!(filename: filename, content_type: content_type, r2_key: key, processing_status: "pending")

      render json: { data: { media_file_id: mf.id, presigned_url: url, r2_key: key, expires_in: 3600 } }
    end

    def complete
      mf = current_organization.media_files.find(params.require(:media_file_id))
      mf.update!(processing_status: "processing", file_size: params[:file_size], episode_id: params[:episode_id])
      ProcessAudioJob.perform_later(mf.id) if mf.audio?
      render json: { data: { media_file_id: mf.id, public_url: mf.public_url, processing_status: mf.processing_status } }
    end
  end
end
