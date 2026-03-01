module Api::V1
  class PodcastsController < ApplicationController
    before_action :current_organization
    before_action :require_organization_membership!
    before_action :set_podcast, only: [:show, :update, :destroy, :rss, :publish, :unpublish]

    def index   = render(json: { data: current_organization.podcasts.order(:title).map { |p| podcast_json(p) } })
    def show    = render(json: { data: podcast_json(@podcast) })
    def destroy = (@podcast.destroy!; render(json: { message: "Deleted." }))

    def create
      require_editor!
      p = current_organization.podcasts.build(podcast_params)
      p.save ? render(json: { data: podcast_json(p) }, status: :created) : render(json: { errors: p.errors.full_messages }, status: :unprocessable_entity)
    end

    def update
      require_editor!
      @podcast.update(podcast_params) ? render(json: { data: podcast_json(@podcast) }) : render(json: { errors: @podcast.errors.full_messages }, status: :unprocessable_entity)
    end

    def publish
      require_editor!
      if @podcast.artwork_url.blank?
        return render json: { error: "Artwork is required to publish. Add cover art in Edit." }, status: :unprocessable_entity
      end
      @podcast.update!(published: true, published_at: @podcast.published_at || Time.current)
      render json: { data: podcast_json(@podcast) }
    end

    def unpublish
      require_editor!
      @podcast.update!(published: false)
      render json: { data: podcast_json(@podcast) }
    end

    def rss
      episodes = @podcast.published_episodes.limit(100)
      render :rss, locals: { podcast: @podcast, episodes: episodes }, formats: [:xml]
    end

    private

    def set_podcast = (@podcast = current_organization.podcasts.find_by!(slug: params[:slug]))

    def podcast_params
      params.require(:podcast).permit(:title, :description, :author, :email, :slug,
        :artwork_url, :language, :category, :subcategory, :explicit, :podcast_type, :website_url, :copyright)
    end

    def podcast_json(p)
      { id: p.id, title: p.title, description: p.description, author: p.author, email: p.email,
        slug: p.slug, artwork_url: p.artwork_url, language: p.language, category: p.category,
        explicit: p.explicit, podcast_type: p.podcast_type, website_url: p.website_url,
        published: p.published, published_at: p.published_at, rss_url: p.rss_url,
        episode_count: p.episodes.count, published_episode_count: p.published_episodes.count,
        created_at: p.created_at, updated_at: p.updated_at }
    end
  end
end
