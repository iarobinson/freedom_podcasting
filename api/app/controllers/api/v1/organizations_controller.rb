module Api::V1
  class OrganizationsController < ApplicationController
    before_action :current_organization
    before_action :require_organization_membership!

    # GET /api/v1/organizations/:slug/members
    def members
      memberships = current_organization.memberships.includes(:user).order(:created_at)
      render json: { data: memberships.map { |m| member_json(m) } }
    end

    # POST /api/v1/organizations/:slug/invite
    def invite
      require_manager!
      email = params.require(:email).strip.downcase
      role  = params.require(:role)

      unless Membership::ROLES.include?(role) && role != "owner"
        return render json: { error: "Invalid role. Must be admin, editor, or viewer." }, status: :unprocessable_entity
      end

      user = User.find_by(email: email)

      if user
        m = current_organization.memberships.find_or_initialize_by(user: user)
        if m.accepted_at?
          return render json: { error: "#{email} is already a member of this organization." }, status: :unprocessable_entity
        end
        token = SecureRandom.urlsafe_base64(32)
        m.update!(role: role, invitation_token: token, invited_at: Time.current)
        InvitationMailer.invite_existing(m, current_user).deliver_later
        render json: { message: "Invitation sent to #{email}.", data: member_json(m) }, status: :created
      else
        # Unknown email: sign a JWT payload (no DB row needed until they register)
        payload = {
          org_id:     current_organization.id,
          org_name:   current_organization.name,
          email:      email,
          role:       role,
          invited_by: current_user.id,
          exp:        7.days.from_now.to_i
        }
        signed_token = JWT.encode(payload, Rails.application.secret_key_base, "HS256")
        InvitationMailer.invite_new_user(email, signed_token, current_user, current_organization).deliver_later
        render json: { message: "Invitation sent to #{email}." }, status: :created
      end
    end

    # DELETE /api/v1/organizations/:slug/members/:user_id
    def remove_member
      require_manager!
      m = current_organization.memberships.find_by!(user_id: params[:user_id])
      return render json: { error: "Cannot remove the organization owner." }, status: :forbidden if m.role == "owner"
      return render json: { error: "Cannot remove yourself." }, status: :forbidden if m.user == current_user
      m.destroy!
      render json: { message: "Member removed." }
    end

    # PATCH /api/v1/organizations/:slug/members/:user_id/role
    def update_member_role
      require_manager!
      m = current_organization.memberships.find_by!(user_id: params[:user_id])
      return render json: { error: "Cannot change the owner's role." }, status: :forbidden if m.role == "owner"

      new_role = params.require(:role)
      unless Membership::ROLES.include?(new_role) && new_role != "owner"
        return render json: { error: "Invalid role." }, status: :unprocessable_entity
      end

      m.update!(role: new_role)
      render json: { data: member_json(m) }
    end

    private

    # Member routes on the organization itself use params[:slug], not params[:organization_slug]
    # (params[:organization_slug] is only set for resources nested *under* organizations)
    def current_organization
      @current_organization ||= Organization.find_by!(slug: params[:slug])
    end

    def member_json(m)
      {
        user_id:      m.user_id,
        email:        m.user.email,
        full_name:    m.user.full_name,
        role:         m.role,
        invited_at:   m.invited_at,
        accepted_at:  m.accepted_at
      }
    end
  end
end
