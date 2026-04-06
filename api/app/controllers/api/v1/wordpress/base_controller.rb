module Api::V1::Wordpress
  # Base controller for all WordPress API endpoints.
  # Authenticates via PersonalAccessToken (fp_pat_xxx) instead of Devise JWT.
  # Inherits directly from ActionController::API to avoid ApplicationController's
  # authenticate_user! before_action and Devise hooks.
  class BaseController < ActionController::API
    include PersonalAccessTokenAuthenticatable

    before_action :authenticate_via_pat!

    rescue_from StandardError,               with: :render_internal_error
    rescue_from ActiveRecord::RecordInvalid,  with: :render_unprocessable
    rescue_from ActiveRecord::RecordNotFound, with: :render_not_found

    private

    def render_not_found          = render(json: { error: "Not found." }, status: :not_found)
    def render_unprocessable(e)   = render(json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity)
    def render_internal_error(e)
      Rails.logger.error("[WP 500] #{e.class}: #{e.message} | user=#{current_user&.id} #{request.method} #{request.path}")
      render json: { error: "An unexpected error occurred." }, status: :internal_server_error
    end
  end
end
