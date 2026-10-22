module Api::V1::Staff
  class CheckoutLinksController < BaseController
    def create
      org = Organization.find_by!(slug: params[:org_slug])
      price_cents = params[:price_cents].to_i
      plan        = params[:plan].presence || "starter"
      interval    = params[:interval].presence || "month"

      unless (Organization::PLANS - ["free"]).include?(plan) && StripePrices::INTERVALS.include?(interval)
        return render json: { error: "Invalid plan or billing interval." }, status: :unprocessable_entity
      end

      if price_cents < 100
        return render json: { error: "Price must be at least $1.00." }, status: :unprocessable_entity
      end

      payload = {
        org_slug:    org.slug,
        price_cents: price_cents,
        plan:        plan,
        interval:    interval,
        exp:         30.days.from_now.to_i,
      }
      payload[:test] = true if ActiveModel::Type::Boolean.new.cast(params[:test])

      token = JWT.encode(payload, Rails.application.secret_key_base, "HS256")
      url   = "#{ENV.fetch('FRONTEND_URL')}/join/#{token}"

      render json: { url: url }
    end
  end
end
