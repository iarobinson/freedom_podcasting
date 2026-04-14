module Public
  class FeedsController < ActionController::Base
    rescue_from ActiveRecord::RecordNotFound, with: -> { head :not_found }

    # GET /feeds/:feed_token — canonical token-based URL.
    # Also handles legacy slug-based URLs for backward compat with existing subscribers.
    def show
      identifier = params[:podcast_slug]
      # Token-based lookup: accessible with just the token (no published gate — token is the access control)
      # Slug-based lookup: only published podcasts (legacy URLs, public-facing)
      @podcast = Podcast.find_by(rss_token: identifier) ||
                 Podcast.published.find_by!(slug: identifier)
      render_feed
    end

    # GET /feeds/:org_slug/:podcast_slug — 301 redirect to canonical token URL.
    # Existing subscribers using the old org-scoped URL are transparently migrated.
    def show_scoped
      org     = Organization.find_by!(slug: params[:org_slug])
      podcast = org.podcasts.published.find_by!(slug: params[:podcast_slug])
      redirect_to "#{request.protocol}#{request.host_with_port}/feeds/#{podcast.rss_token}",
                  status: :moved_permanently
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
