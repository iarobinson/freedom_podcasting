module Api::V1::Wordpress
  class UploadsController < BaseController
    ALLOWED_AUDIO = %w[audio/mpeg audio/mp4 audio/ogg audio/wav audio/x-wav audio/flac].freeze

    # POST /api/v1/wordpress/podcasts/:podcast_id/uploads/presign
    def presign
      podcast = current_organization.podcasts.find(params[:podcast_id])

      filename, content_type = params.require([:filename, :content_type])
      unless ALLOWED_AUDIO.include?(content_type)
        return render json: { error: "File type not allowed." }, status: :unprocessable_entity
      end

      key = "organizations/#{current_organization.id}/audio/#{SecureRandom.uuid}#{File.extname(filename).downcase}"
      url = StorageService.new.presigned_upload_url(key: key, content_type: content_type)
      mf  = current_organization.media_files.create!(
        filename:          filename,
        content_type:      content_type,
        r2_key:            key,
        podcast:           podcast,
        processing_status: "pending"
      )

      render json: { data: { media_file_id: mf.id, presigned_url: url, r2_key: key, expires_in: 3600 } }
    end

    # POST /api/v1/wordpress/podcasts/:podcast_id/uploads/complete
    def complete
      podcast = current_organization.podcasts.find(params[:podcast_id])
      mf      = current_organization.media_files.find(params.require(:media_file_id))

      mf.update!(processing_status: "processing", file_size: params[:file_size], podcast: podcast)

      # WordPress uploads: process audio metadata but skip AI pipeline.
      # AI features are available only through the full FP dashboard.
      ProcessAudioJob.perform_later(mf.id)

      render json: { data: { media_file_id: mf.id, public_url: mf.public_url, processing_status: mf.processing_status } }
    end
  end
end
