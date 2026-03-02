module Api::V1
  class InvitationsController < ApplicationController
    # POST /api/v1/invitations/accept
    # Requires JWT authentication — user must be logged in
    def accept
      token = params.require(:token)

      # Case 1: Token stored on a pending membership row (invited existing user)
      if (m = Membership.find_by(invitation_token: token))
        if m.invited_at < 7.days.ago
          return render json: { error: "This invitation has expired." }, status: :gone
        end
        unless m.user == current_user
          return render json: { error: "This invitation was sent to a different account." }, status: :forbidden
        end
        m.update!(accepted_at: Time.current, invitation_token: nil)
        render json: { message: "Welcome to #{m.organization.name}!", data: { org_slug: m.organization.slug } }

      # Case 2: Signed JWT payload (new user who just registered)
      else
        begin
          payload = JWT.decode(token, Rails.application.secret_key_base, true, algorithms: ["HS256"]).first
          org     = Organization.find(payload["org_id"])
          existing = org.memberships.find_by(user: current_user)
          if existing&.accepted_at?
            return render json: { message: "You're already a member of #{org.name}.", data: { org_slug: org.slug } }
          end
          m = org.memberships.find_or_initialize_by(user: current_user)
          m.update!(role: payload["role"], accepted_at: Time.current, invitation_token: nil)
          render json: { message: "Welcome to #{org.name}!", data: { org_slug: org.slug } }
        rescue JWT::DecodeError, JWT::ExpiredSignature
          render json: { error: "Invalid or expired invitation token." }, status: :unprocessable_entity
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Organization not found." }, status: :not_found
        end
      end
    end
  end
end
