module Api
  module V1
    module Auth
      class MeController < ApplicationController
        def show
          render json: { data: {
            id:           current_user.id,
            email:        current_user.email,
            first_name:   current_user.first_name,
            last_name:    current_user.last_name,
            full_name:    current_user.full_name,
            confirmed_at: current_user.confirmed_at,
            is_staff:     current_user.is_staff,
            staff_role:   current_user.staff_role,
            organizations: current_user.organizations.map { |org|
              {
                id:   org.id,
                name: org.name,
                slug: org.slug,
                plan: org.plan,
                role: current_user.role_in(org)
              }
            }
          }}
        end
      end
    end
  end
end
