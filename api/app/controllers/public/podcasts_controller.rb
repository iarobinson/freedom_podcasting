module Public
  class PodcastsController < ActionController::API
    # ── Org-scoped actions (canonical) ──────────────────────────────────────

    # GET /public/podcasts/:org_slug/:podcast_slug
    def show
      render json: { data: podcast_json(scoped_podcast) }
    end

    # GET /public/podcasts/:org_slug/:podcast_slug/episodes
    def episodes
      render json: { data: scoped_podcast.published_episodes.limit(100).map { |e| episode_json(e) } }
    end

    # GET /public/podcasts/:org_slug/:podcast_slug/episodes/:episode_id
    def episode
      ep = scoped_podcast.published_episodes.find_by(slug: params[:episode_id]) ||
           scoped_podcast.published_episodes.find(params[:episode_id])
      render json: { data: episode_json(ep) }
    end

    # ── Legacy slug-only actions (backward-compat, may be ambiguous) ─────────

    def show_legacy
      render json: { data: podcast_json(legacy_podcast) }
    end

    def episodes_legacy
      render json: { data: legacy_podcast.published_episodes.limit(100).map { |e| episode_json(e) } }
    end

    def episode_legacy
      ep = legacy_podcast.published_episodes.find_by(slug: params[:episode_id]) ||
           legacy_podcast.published_episodes.find(params[:episode_id])
      render json: { data: episode_json(ep) }
    end

    private

    def scoped_podcast
      @scoped_podcast ||= begin
        org = Organization.find_by!(slug: params[:org_slug])
        org.podcasts.published.find_by!(slug: params[:podcast_slug])
      end
    end

    def legacy_podcast
      @legacy_podcast ||= Podcast.published.find_by!(slug: params[:slug])
    end

    def podcast_json(p)
      { id: p.id, title: p.title, description: p.description, author: p.author,
        slug: p.slug, org_slug: p.organization.slug,
        artwork_url: p.artwork_url, language: p.language,
        category: p.category, website_url: p.website_url, explicit: p.explicit,
        podcast_type: p.podcast_type, episode_count: p.published_episodes.count,
        apple_podcasts_url: p.apple_podcasts_url, spotify_url: p.spotify_url, amazon_music_url: p.amazon_music_url }
    end

    def episode_json(e)
      { id: e.id, slug: e.slug, title: e.title, description: e.description, summary: e.summary,
        audio_url: e.audio_url, audio_content_type: e.audio_content_type,
        audio_file_size: e.audio_file_size, audio_duration_seconds: e.audio_duration_seconds,
        formatted_duration: e.formatted_duration, episode_number: e.episode_number,
        season_number: e.season_number, episode_type: e.episode_type,
        explicit: e.explicit, published_at: e.published_at, guid: e.guid,
        transcript: e.transcript, waveform_peaks: e.waveform_peaks }
    end
  end
end
