module Api::V1::Public
  class CheckoutController < ActionController::API
    def show
      org, price_cents = decode_token!
      podcast = org.podcasts.order(:created_at).first

      render json: {
        data: {
          org_name:           org.name,
          price_cents:        price_cents,
          podcast_title:      podcast&.title,
          podcast_artwork:    podcast&.artwork_url,
          already_subscribed: org.plan != "free",
        }
      }
    rescue JWT::DecodeError, JWT::ExpiredSignature
      render json: { error: "This link is invalid or has expired. Please contact us for a new one." }, status: :unprocessable_entity
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Organization not found." }, status: :not_found
    end

    def checkout
      org, price_cents = decode_token!

      if org.stripe_subscription_id.present?
        return render json: { error: "This organization already has an active subscription." }, status: :unprocessable_entity
      end

      session = Stripe::Checkout::Session.create(
        mode:       "subscription",
        customer:   org.stripe_customer_id.presence,
        line_items: [{
          price_data: {
            currency:     "usd",
            unit_amount:  price_cents,
            recurring:    { interval: "month" },
            product_data: { name: "Freedom Podcasting Hosting" },
          },
          quantity: 1,
        }],
        success_url: "#{ENV.fetch('FRONTEND_URL')}/join/success",
        cancel_url:  "#{ENV.fetch('FRONTEND_URL')}/join/#{params[:token]}",
        metadata:    { organization_id: org.id, plan: "starter" }
      )

      render json: { url: session.url }
    rescue JWT::DecodeError, JWT::ExpiredSignature
      render json: { error: "This link is invalid or has expired." }, status: :unprocessable_entity
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Organization not found." }, status: :not_found
    end

    private

    def decode_token!
      payload = JWT.decode(
        params[:token],
        Rails.application.secret_key_base,
        true,
        algorithms: ["HS256"]
      ).first
      org = Organization.find_by!(slug: payload["org_slug"])
      [org, payload["price_cents"]]
    end
  end
end
