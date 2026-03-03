module Public
  class PodcastsController < ActionController::API
    # GET /public/podcasts/:slug
    def show
      podcast = Podcast.published.find_by!(slug: params[:slug])
      render json: { data: podcast_json(podcast) }
    end

    # GET /public/podcasts/:slug/episodes
    def episodes
      podcast  = Podcast.published.find_by!(slug: params[:slug])
      episodes = podcast.published_episodes.limit(100)
      render json: { data: episodes.map { |e| episode_json(e) } }
    end

    # GET /public/podcasts/:slug/episodes/:episode_id
    def episode
      podcast = Podcast.published.find_by!(slug: params[:slug])
      ep = podcast.published_episodes.find_by(slug: params[:episode_id]) ||
           podcast.published_episodes.find(params[:episode_id])
      render json: { data: episode_json(ep) }
    end

    private

    def podcast_json(p)
      { id: p.id, title: p.title, description: p.description, author: p.author,
        slug: p.slug, artwork_url: p.artwork_url, language: p.language,
        category: p.category, website_url: p.website_url, explicit: p.explicit,
        podcast_type: p.podcast_type, episode_count: p.published_episodes.count }
    end

    def episode_json(e)
      { id: e.id, slug: e.slug, title: e.title, description: e.description, summary: e.summary,
        audio_url: e.audio_url, audio_content_type: e.audio_content_type,
        audio_file_size: e.audio_file_size, audio_duration_seconds: e.audio_duration_seconds,
        formatted_duration: e.formatted_duration, episode_number: e.episode_number,
        season_number: e.season_number, episode_type: e.episode_type,
        explicit: e.explicit, published_at: e.published_at, guid: e.guid }
    end
  end
end
