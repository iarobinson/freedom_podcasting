module Api::V1
  class EpisodesController < ApplicationController
    before_action :current_organization
    before_action :require_organization_membership!
    before_action :set_podcast
    before_action :set_episode, only: [:show, :update, :destroy, :publish, :unpublish, :submit_for_review, :approve, :reject, :transcribe, :generate_show_notes, :checkout_ai]

    def index
      episodes = @podcast.episodes.order(created_at: :desc)
      render json: { data: episodes.map { |e| episode_json(e) }, meta: { total: episodes.count } }
    end

    def show    = render(json: { data: episode_json(@episode) })
    def destroy = (@episode.destroy!; render(json: { message: "Deleted." }))

    def create
      require_editor!
      e = @podcast.episodes.build(episode_params)
      e.save ? render(json: { data: episode_json(e) }, status: :created) : render(json: { errors: e.errors.full_messages }, status: :unprocessable_entity)
    end

    def update
      require_editor!
      @episode.update(episode_params) ? render(json: { data: episode_json(@episode) }) : render(json: { errors: @episode.errors.full_messages }, status: :unprocessable_entity)
    end

    def publish
      require_editor!
      return if enforce_monthly_publish_limit!
      return render(json: { error: "Audio required to publish." }, status: :unprocessable_entity) if @episode.audio_url.blank?
      @episode.update!(status: "published", published_at: @episode.published_at || Time.current)
      render json: { data: episode_json(@episode) }
    end

    def unpublish
      require_editor!
      @episode.update!(status: "draft")
      render json: { data: episode_json(@episode) }
    end

    def submit_for_review
      require_editor!
      return render(json: { error: "Only draft episodes can be submitted for review." }, status: :unprocessable_entity) unless @episode.status == "draft"
      @episode.update!(status: "review", review_notes: nil)
      render json: { data: episode_json(@episode) }
    end

    def approve
      require_manager!
      return render(json: { error: "Only episodes in review can be approved." }, status: :unprocessable_entity) unless @episode.in_review?
      @episode.update!(status: "approved", reviewed_by: current_user, reviewed_at: Time.current, review_notes: nil)
      render json: { data: episode_json(@episode) }
    end

    def reject
      require_manager!
      return render(json: { error: "Only episodes in review can be rejected." }, status: :unprocessable_entity) unless @episode.in_review?
      @episode.update!(status: "draft", review_notes: params[:notes], reviewed_by: current_user, reviewed_at: Time.current)
      render json: { data: episode_json(@episode) }
    end

    def checkout_ai
      require_editor!
      return render json: { url: nil } if @episode.ai_purchased_at.present?

      duration_seconds = @episode.audio_duration_seconds
      if duration_seconds.blank?
        return render json: { error: "Audio is still being processed. Please wait a moment and try again." },
                      status: :unprocessable_entity
      end

      cents_per_minute = ENV.fetch("STRIPE_AI_PRICE_PER_MINUTE_CENTS", "50").to_i
      minutes          = (duration_seconds / 60.0).ceil
      amount_cents     = minutes * cents_per_minute

      session = Stripe::Checkout::Session.create(
        mode:       "payment",
        line_items: [{
          price_data: {
            currency:     "usd",
            unit_amount:  amount_cents,
            product_data: { name: "Episode AI Processing — #{minutes} min" }
          },
          quantity: 1
        }],
        success_url: "#{ENV.fetch('WEB_URL')}/dashboard/podcasts/#{@podcast.slug}/episodes/#{@episode.id}/edit?ai_purchased=true",
        cancel_url:  "#{ENV.fetch('WEB_URL')}/dashboard/podcasts/#{@podcast.slug}/episodes/#{@episode.id}/edit",
        metadata:    { organization_id: current_organization.id, episode_id: @episode.id, podcast_slug: @podcast.slug }
      )
      render json: { url: session.url }
    end

    def transcribe
      require_editor!
      return if enforce_ai_features!(episode: @episode)
      return render(json: { error: "No audio file." }, status: :unprocessable_entity) unless @episode.audio_url.present?
      if %w[pending processing].include?(@episode.transcription_status)
        return render(json: { error: "Transcription already in progress." }, status: :unprocessable_entity)
      end
      @episode.update!(transcription_status: "pending")
      TranscribeEpisodeJob.perform_later(@episode.id)
      render json: { transcription_status: "pending" }
    end

    def generate_show_notes
      require_editor!
      return if enforce_ai_features!(episode: @episode)
      return render(json: { error: "No transcript available." }, status: :unprocessable_entity) unless @episode.transcript.present?
      if %w[pending processing].include?(@episode.show_notes_ai_status)
        return render(json: { error: "Already generating." }, status: :unprocessable_entity)
      end
      @episode.update!(show_notes_ai_status: "pending")
      GenerateShowNotesJob.perform_later(@episode.id)
      render json: { show_notes_ai_status: "pending" }
    end

    private

    def set_podcast = (@podcast = current_organization.podcasts.find_by!(slug: params[:podcast_slug]))
    def set_episode = (@episode = @podcast.episodes.find(params[:id]))

    def episode_params
      params.require(:episode).permit(:title, :description, :summary, :artwork_url,
        :audio_url, :audio_file_size, :audio_duration_seconds, :audio_content_type,
        :episode_type, :episode_number, :season_number, :explicit, :keywords, :status, :published_at,
        :slug)
    end

    def episode_json(e)
      { id: e.id, slug: e.slug, title: e.title, description: e.description, summary: e.summary,
        artwork_url: e.artwork_url, audio_url: e.audio_url, audio_file_size: e.audio_file_size,
        audio_duration_seconds: e.audio_duration_seconds, formatted_duration: e.formatted_duration,
        audio_content_type: e.audio_content_type, episode_type: e.episode_type,
        episode_number: e.episode_number, season_number: e.season_number, explicit: e.explicit,
        keywords: e.keywords, status: e.status, published_at: e.published_at,
        review_notes: e.review_notes, reviewed_at: e.reviewed_at,
        guid: e.guid, download_count: e.download_count, created_at: e.created_at, updated_at: e.updated_at,
        transcript: e.transcript, transcription_status: e.transcription_status,
        show_notes_ai: e.show_notes_ai, show_notes_ai_status: e.show_notes_ai_status,
        ai_metadata_status: e.ai_metadata_status, ai_purchased_at: e.ai_purchased_at }
    end
  end
end
