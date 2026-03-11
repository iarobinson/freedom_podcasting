module Public
  class EpisodesController < ActionController::Base
    # GET /feeds/:org_slug/:podcast_slug/episodes/:guid — canonical
    def show_scoped
      org     = Organization.find_by!(slug: params[:org_slug])
      podcast = org.podcasts.published.find_by!(slug: params[:podcast_slug])
      episode = podcast.published_episodes.find_by!(guid: params[:guid])
      episode.increment!(:download_count)
      redirect_to episode.audio_url, allow_other_host: true, status: :found
    end

    # GET /feeds/:podcast_slug/episodes/:guid — legacy
    def show
      podcast = Podcast.published.find_by!(slug: params[:podcast_slug])
      episode = podcast.published_episodes.find_by!(guid: params[:guid])
      episode.increment!(:download_count)
      redirect_to episode.audio_url, allow_other_host: true, status: :found
    end
  end
end
