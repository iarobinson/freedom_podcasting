module Api
  module V1
    module Auth
      class SessionsController < Devise::SessionsController
        respond_to :json

        private

        def respond_with(resource, _opts = {})
          render json: {
            message: "Logged in.",
            data: {
              id:         resource.id,
              email:      resource.email,
              first_name: resource.first_name,
              last_name:  resource.last_name,
              full_name:  resource.full_name
            }
          }, status: :ok
        end

        def respond_to_on_destroy
          if current_user
            render json: { message: "Logged out." }
          else
            render json: { message: "No active session." }, status: :unauthorized
          end
        end
      end
    end
  end
end
