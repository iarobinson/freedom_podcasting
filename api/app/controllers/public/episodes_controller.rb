module Public
  class EpisodesController < ActionController::Base
    # GET /feeds/:feed_token/episodes/:guid — canonical token-based URL.
    # Also handles legacy slug-based URLs for backward compat with existing subscribers.
    def show
      identifier = params[:podcast_slug]
      podcast = Podcast.published.find_by(rss_token: identifier) ||
                Podcast.published.find_by!(slug: identifier)
      episode = podcast.published_episodes.find_by!(guid: params[:guid])
      episode.increment!(:download_count)
      redirect_to episode.audio_url, allow_other_host: true, status: :found
    end

    # GET /feeds/:org_slug/:podcast_slug/episodes/:guid — 301 redirect to canonical token URL.
    def show_scoped
      org     = Organization.find_by!(slug: params[:org_slug])
      podcast = org.podcasts.published.find_by!(slug: params[:podcast_slug])
      redirect_to "#{request.protocol}#{request.host_with_port}/feeds/#{podcast.rss_token}/episodes/#{params[:guid]}",
                  status: :moved_permanently
    end
  end
end
