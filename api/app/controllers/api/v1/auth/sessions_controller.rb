module Api::V1::Auth
  class SessionsController < Devise::SessionsController
    respond_to :json

    def me
      render json: { data: {
        id: current_user.id, email: current_user.email,
        first_name: current_user.first_name, last_name: current_user.last_name,
        full_name: current_user.full_name,
        organizations: current_user.organizations.map { |org|
          { id: org.id, name: org.name, slug: org.slug, plan: org.plan, role: current_user.role_in(org) }
        }
      }}
    end

    private

    def respond_with(resource, _opts = {})
      render json: { message: "Logged in.", data: {
        id: resource.id, email: resource.email,
        first_name: resource.first_name, last_name: resource.last_name, full_name: resource.full_name
      }}, status: :ok
    end

    def respond_to_on_destroy
      current_user ? render(json: { message: "Logged out." }) : render(json: { message: "No session." }, status: :unauthorized)
    end
  end
end
