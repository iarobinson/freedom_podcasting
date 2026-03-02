module Public
  class EpisodesController < ActionController::Base
    def show
      podcast = Podcast.published.find_by!(slug: params[:podcast_slug])
      episode = podcast.published_episodes.find_by!(guid: params[:guid])
      episode.increment!(:download_count)
      redirect_to episode.audio_url, allow_other_host: true, status: :found
    end
  end
end
