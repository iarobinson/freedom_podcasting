module Api::V1::Staff
  class OrganizationsController < BaseController

    # GET /api/v1/staff/organizations
    def index
      scope = Organization.order(created_at: :desc)
      scope = scope.where("name ILIKE ?", "%#{params[:q]}%") if params[:q].present?

      page     = [params[:page].to_i, 1].max
      per_page = 25
      total    = scope.count
      orgs     = scope.offset((page - 1) * per_page).limit(per_page)

      render json: {
        data: orgs.map { |o| org_json(o) },
        meta: { total: total, page: page, per_page: per_page }
      }
    end

    # POST /api/v1/staff/organizations
    def create
      org_params = params.require(:organization).permit(:name, :slug)
      plan       = params[:plan].presence || "free"
      rss_url    = params[:rss_url].presence

      # Auto-derive slug from name if not provided
      if org_params[:slug].blank?
        base = org_params[:name].to_s.downcase.gsub(/[^a-z0-9]/, "-").gsub(/-+/, "-").first(40).then { |s| s.gsub(/\A-+|-+\z/, "") }
        slug = base; i = 1
        while Organization.exists?(slug: slug); slug = "#{base}-#{i}"; i += 1; end
        org_params = org_params.merge(slug: slug)
      end

      org = Organization.new(org_params.merge(plan: plan))

      unless org.save
        return render json: { errors: org.errors.full_messages }, status: :unprocessable_entity
      end

      # Kick off RSS import if a feed URL was provided
      if rss_url.present?
        import = PodcastImport.create!(organization: org, rss_url: rss_url)
        ImportRssFeedJob.perform_later(import.id)
      end

      render json: { data: org_json(org) }, status: :created
    end

    private

    def org_json(org)
      {
        id:            org.id,
        name:          org.name,
        slug:          org.slug,
        plan:          org.plan,
        podcast_count: org.podcasts.count,
        created_at:    org.created_at
      }
    end
  end
end
