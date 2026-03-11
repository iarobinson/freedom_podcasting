module Public
  class FeedsController < ActionController::Base
    # GET /feeds/:org_slug/:podcast_slug — canonical, org-scoped (no slug collision)
    def show_scoped
      org      = Organization.find_by!(slug: params[:org_slug])
      @podcast = org.podcasts.published.find_by!(slug: params[:podcast_slug])
      render_feed
    end

    # GET /feeds/:podcast_slug — legacy, kept for existing RSS subscribers
    def show
      @podcast = Podcast.published.find_by!(slug: params[:podcast_slug])
      render_feed
    end

    private

    def render_feed
      @episodes = @podcast.published_episodes.limit(100)
      response.headers["Content-Type"]  = "application/rss+xml; charset=utf-8"
      response.headers["Cache-Control"] = "public, max-age=300"
      render template: "public/feeds/show", formats: [:xml], locals: {
        podcast:  @podcast,
        episodes: @episodes
      }
    end
  end
end
