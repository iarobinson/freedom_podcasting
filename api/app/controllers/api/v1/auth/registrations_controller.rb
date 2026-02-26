module Api::V1::Auth
  class RegistrationsController < Devise::RegistrationsController
    respond_to :json

    private

    def respond_with(resource, _opts = {})
      if resource.persisted?
        org = create_personal_org(resource)
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
      params.require(:user).permit(:email, :password, :password_confirmation, :first_name, :last_name)
    end

    def create_personal_org(user)
      base = user.full_name.downcase.gsub(/[^a-z0-9]/, "-").gsub(/-+/, "-").first(40)
      slug = base; i = 1
      while Organization.exists?(slug: slug); slug = "#{base}-#{i}"; i += 1; end
      org = Organization.create!(name: "#{user.first_name}'s Podcasts", slug: slug, plan: "free")
      Membership.create!(user: user, organization: org, role: "owner", accepted_at: Time.current)
      org
    end
  end
end
