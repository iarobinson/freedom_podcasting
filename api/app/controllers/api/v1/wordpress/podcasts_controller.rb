module Api::V1::Wordpress
  class PodcastsController < BaseController
    before_action :set_podcast, only: [:update]

    # POST /api/v1/wordpress/podcasts
    # Creates or updates the podcast linked to this WordPress site.
    # If fp_podcast_id is provided, updates that podcast; otherwise creates a new one.
    def create
      if params[:fp_podcast_id].present?
        podcast = current_organization.podcasts.find(params[:fp_podcast_id])
        podcast.update!(podcast_params)
      else
        podcast = current_organization.podcasts.create!(podcast_params)
      end

      render json: { data: podcast_json(podcast) }, status: :created
    end

    # PATCH /api/v1/wordpress/podcasts/:id
    def update
      @podcast.update!(podcast_params)
      render json: { data: podcast_json(@podcast) }
    end

    private

    def set_podcast
      @podcast = current_organization.podcasts.find(params[:id])
    end

    def podcast_params
      params.permit(
        :title, :description, :author, :email, :language,
        :category, :explicit, :artwork_url, :website_url, :slug,
        :podcast_type
      ).tap do |p|
        # Auto-generate slug from title if not provided on create
        if p[:slug].blank? && params[:title].present?
          base = params[:title].downcase.gsub(/[^a-z0-9]/, "-").gsub(/-+/, "-").first(40).gsub(/\A-|-\z/, "")
          slug = base
          i = 1
          while Podcast.exists?(slug: slug)
            slug = "#{base}-#{i}"
            i += 1
          end
          p[:slug] = slug
        end
      end
    end

    def podcast_json(podcast)
      {
        id:          podcast.id,
        title:       podcast.title,
        slug:        podcast.slug,
        artwork_url: podcast.artwork_url,
        rss_url:     podcast.rss_url,
        published:   podcast.published
      }
    end
  end
end
