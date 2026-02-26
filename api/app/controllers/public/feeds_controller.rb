module Public
  class FeedsController < ActionController::API
    def show
      @podcast  = Podcast.published.find_by!(slug: params[:podcast_slug])
      @episodes = @podcast.published_episodes.limit(100)
      response.headers["Content-Type"]  = "application/rss+xml; charset=utf-8"
      response.headers["Cache-Control"] = "public, max-age=300"
      render "public/feeds/show", formats: [:xml]
    end
  end
end
