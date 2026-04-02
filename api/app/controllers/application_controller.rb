class ApplicationController < ActionController::API
  include ActionController::Cookies
  include Pundit::Authorization

  before_action :authenticate_user!

  rescue_from Pundit::NotAuthorizedError,   with: :render_forbidden
  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
  rescue_from ActiveRecord::RecordInvalid,  with: :render_unprocessable
  rescue_from StandardError,               with: :render_internal_error

  private

  def render_forbidden               = render(json: { error: "Forbidden." }, status: :forbidden)
  def render_not_found               = render(json: { error: "Not found." }, status: :not_found)
  def render_unprocessable(e)        = render(json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity)

  def render_internal_error(e)
    Rails.logger.error(
      "[500] #{e.class}: #{e.message} | " \
      "user=#{current_user&.id} org=#{params[:organization_slug]} " \
      "#{request.method} #{request.path} | #{e.backtrace&.first(3)&.join(' | ')}"
    )
    render json: { error: "An unexpected error occurred." }, status: :internal_server_error
  end

  def current_organization
    @current_organization ||= Organization.find_by!(slug: params[:organization_slug])
  end

  def require_organization_membership!
    @current_membership = current_user.memberships.find_by(organization: current_organization)
    render_forbidden unless @current_membership
  end

  def require_editor!
    require_organization_membership!
    render_forbidden unless @current_membership&.can_edit?
  end

  def require_manager!
    require_organization_membership!
    render_forbidden unless @current_membership&.can_manage?
  end

  def enforce_podcast_limit!
    if current_organization.at_podcast_limit?
      render json: { error: "Podcast limit reached for your plan. Upgrade to add more." }, status: :unprocessable_entity
    end
  end

  def enforce_member_limit!
    if current_organization.at_member_limit?
      render json: { error: "Member limit reached for your plan. Upgrade to add more members." }, status: :unprocessable_entity
    end
  end

  def enforce_monthly_publish_limit!
    if current_organization.at_monthly_publish_limit?
      render json: { error: "Monthly publish limit reached. Upgrade to publish more episodes." }, status: :unprocessable_entity
    end
  end

  def enforce_ai_features!(episode: nil)
    return unless current_organization.plan == "free"
    return if episode&.ai_purchased_at.present?
    render json: { error: "AI features require a paid plan or a per-episode purchase." }, status: :payment_required
  end
end
