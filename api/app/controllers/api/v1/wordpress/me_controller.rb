module Api::V1::Wordpress
  class MeController < BaseController
    # GET /api/v1/wordpress/me
    def show
      org = current_organization

      podcasts = org.podcasts.order(created_at: :desc).map do |p|
        { id: p.id, title: p.title, slug: p.slug, artwork_url: p.artwork_url, published: p.published }
      end

      render json: {
        data: {
          user:         { id: current_user.id, email: current_user.email, full_name: current_user.full_name },
          organization: { id: org.id, name: org.name, slug: org.slug, plan: org.plan },
          podcasts:     podcasts
        }
      }
    end
  end
end
