module Api::V1::Public
  class CheckoutController < ActionController::API
    def show
      org, price_cents, test_mode, plan, interval = decode_token!
      podcast = org.podcasts.order(:created_at).first

      render json: {
        data: {
          org_name:           org.name,
          price_cents:        price_cents,
          plan:               plan,
          interval:           interval,
          podcast_title:      podcast&.title,
          podcast_artwork:    podcast&.artwork_url,
          already_subscribed: org.stripe_subscription_id.present?,
          test_mode:          test_mode,
        }
      }
    rescue JWT::DecodeError, JWT::ExpiredSignature
      render json: { error: "This link is invalid or has expired. Please contact us for a new one." }, status: :unprocessable_entity
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Organization not found." }, status: :not_found
    end

    def checkout
      org, price_cents, test_mode, plan, interval = decode_token!

      if org.stripe_subscription_id.present?
        return render json: { error: "This organization already has an active subscription." }, status: :unprocessable_entity
      end

      stripe_opts = {}
      if test_mode
        test_key = ENV.fetch("STRIPE_TEST_SECRET_KEY", nil)
        return render json: { error: "Test mode not configured." }, status: :unprocessable_entity if test_key.blank?
        stripe_opts[:api_key] = test_key
      end

      success_url = if test_mode
        "#{ENV.fetch('FRONTEND_URL')}/join/success?test=1"
      else
        "#{ENV.fetch('FRONTEND_URL')}/join/success"
      end

      session = Stripe::Checkout::Session.create(
        {
          mode:       "subscription",
          customer:   test_mode ? nil : org.stripe_customer_id.presence,
          line_items: [{
            price_data: {
              currency:     "usd",
              unit_amount:  price_cents,
              recurring:    { interval: interval },
              product_data: { name: "Freedom Podcasting #{plan.capitalize} Hosting#{' (Test)' if test_mode}" },
            },
            quantity: 1,
          }],
          success_url: success_url,
          cancel_url:  "#{ENV.fetch('FRONTEND_URL')}/join/#{params[:token]}",
          metadata:    { organization_id: org.id, plan: plan, interval: interval, test: test_mode.to_s }
        },
        stripe_opts
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
      # Links issued before plan/interval were added default to starter, monthly.
      [org, payload["price_cents"], payload["test"] == true,
       payload["plan"].presence || "starter", payload["interval"].presence || "month"]
    end
  end
end
