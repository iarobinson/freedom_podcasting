module Api::V1::Wordpress
  # Uses standard JWT auth (user must be logged in to the FP app).
  # This is how PATs are created — not via PAT auth itself.
  class TokensController < ApplicationController
    before_action :set_organization

    # GET /api/v1/wordpress/tokens
    def index
      tokens = current_user.personal_access_tokens
                           .where(organization: @org)
                           .active
                           .order(created_at: :desc)

      render json: { data: tokens.map { |t| token_summary(t) } }
    end

    # POST /api/v1/wordpress/tokens
    def create
      unless params[:callback_url].to_s.start_with?("https://")
        return render json: { error: "callback_url must be an HTTPS URL." }, status: :unprocessable_entity
      end

      membership = current_user.memberships.find_by(organization: @org)
      unless membership&.can_edit?
        return render json: { error: "You need editor or higher role to connect WordPress." }, status: :forbidden
      end

      name = params[:name].presence || "WordPress"
      pat, plaintext = PersonalAccessToken.generate_for(
        user:         current_user,
        organization: @org,
        name:         name.to_s.strip.truncate(100)
      )

      render json: {
        data: {
          token:        plaintext,
          id:           pat.id,
          name:         pat.name,
          organization: { name: @org.name, slug: @org.slug }
        }
      }, status: :created
    end

    # DELETE /api/v1/wordpress/tokens/:id
    def destroy
      pat = current_user.personal_access_tokens.where(organization: @org).find(params[:id])
      pat.revoke!
      render json: { message: "Token revoked." }
    end

    private

    def set_organization
      slug = params[:organization_slug]
      @org = current_user.organizations.find_by!(slug: slug)
    end

    def token_summary(token)
      {
        id:           token.id,
        name:         token.name,
        prefix:       "fp_pat_#{token.token_prefix}...",
        scopes:       token.scopes,
        last_used_at: token.last_used_at,
        created_at:   token.created_at
      }
    end
  end
end
