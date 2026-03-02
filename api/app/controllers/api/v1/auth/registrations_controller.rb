module Api::V1::Auth
  class RegistrationsController < Devise::RegistrationsController
    respond_to :json

    private

    def respond_with(resource, _opts = {})
      if resource.persisted?
        org = create_personal_org(resource)
        # Auto-accept invitation if a token was passed during registration
        accept_invitation(resource, params.dig(:user, :invitation_token))
        render json: { message: "Account created.", data: {
          id: resource.id, email: resource.email,
          first_name: resource.first_name, last_name: resource.last_name,
          full_name: resource.full_name,
          organization: { id: org.id, name: org.name, slug: org.slug, plan: org.plan }
        }}, status: :created
      else
        render json: { message: "Registration failed.", errors: resource.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def sign_up_params
      params.require(:user).permit(:email, :password, :password_confirmation, :first_name, :last_name, :invitation_token)
    end

    def create_personal_org(user)
      base = user.full_name.downcase.gsub(/[^a-z0-9]/, "-").gsub(/-+/, "-").first(40)
      slug = base; i = 1
      while Organization.exists?(slug: slug); slug = "#{base}-#{i}"; i += 1; end
      org = Organization.create!(name: "#{user.first_name}'s Podcasts", slug: slug, plan: "free")
      Membership.create!(user: user, organization: org, role: "owner", accepted_at: Time.current)
      org
    end

    def accept_invitation(user, token)
      return if token.blank?
      payload = JWT.decode(token, Rails.application.secret_key_base, true, algorithms: ["HS256"]).first
      org = Organization.find(payload["org_id"])
      m   = org.memberships.find_or_initialize_by(user: user)
      m.update!(role: payload["role"], accepted_at: Time.current, invitation_token: nil)
    rescue JWT::DecodeError, JWT::ExpiredSignature, ActiveRecord::RecordNotFound, ActiveRecord::RecordInvalid
      # Silently ignore — user still gets their personal org
    end
  end
end
