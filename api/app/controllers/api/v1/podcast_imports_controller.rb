module Api::V1
  class PodcastImportsController < ApplicationController
    before_action :current_organization
    before_action :require_organization_membership!

    def create
      require_editor!
      return if enforce_podcast_limit!
      import = current_organization.podcast_imports.create!(
        rss_url: params.require(:rss_url),
        status: "pending"
      )
      ImportRssFeedJob.perform_later(import.id)
      render json: { data: import_json(import) }, status: :created
    end

    def show
      import = current_organization.podcast_imports.find(params[:id])
      render json: { data: import_json(import) }
    end

    private

    def import_json(i)
      { id: i.id, status: i.status, rss_url: i.rss_url,
        total_episodes: i.total_episodes, imported_episodes: i.imported_episodes,
        podcast_id: i.podcast_id, podcast_slug: i.podcast&.slug,
        error_message: i.error_message, created_at: i.created_at }
    end
  end
end
