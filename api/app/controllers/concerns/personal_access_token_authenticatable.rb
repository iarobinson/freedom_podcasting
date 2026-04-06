module PersonalAccessTokenAuthenticatable
  extend ActiveSupport::Concern

  # Use this as before_action in WordPress controllers instead of authenticate_user!
  def authenticate_via_pat!
    raw = request.headers["Authorization"]&.delete_prefix("Bearer ")&.strip
    token = PersonalAccessToken.authenticate(raw.to_s)

    if token
      @current_user         = token.user
      @current_organization = token.organization
    else
      render json: { error: "Invalid or expired token." }, status: :unauthorized
    end
  end

  private

  # Override ApplicationController's current_organization so PAT-authenticated
  # controllers return the org from the token, not from params.
  def current_organization
    @current_organization
  end
end
