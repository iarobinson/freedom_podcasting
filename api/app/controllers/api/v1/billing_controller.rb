module Api::V1
  class BillingController < ApplicationController
    before_action :current_organization
    before_action :require_organization_membership!

    PRICE_MAP = {
      "starter" => ENV["STRIPE_STARTER_PRICE_ID"],
      "pro"     => ENV["STRIPE_PRO_PRICE_ID"],
      "agency"  => ENV["STRIPE_AGENCY_PRICE_ID"],
    }.freeze

    def checkout
      plan     = params[:plan]
      price_id = PRICE_MAP[plan]
      return render json: { error: "Invalid plan." }, status: :unprocessable_entity unless price_id

      session = Stripe::Checkout::Session.create(
        mode:         "subscription",
        customer:     current_organization.stripe_customer_id.presence,
        line_items:   [{ price: price_id, quantity: 1 }],
        success_url:  "#{ENV.fetch('WEB_URL')}/dashboard/settings/billing?success=true",
        cancel_url:   "#{ENV.fetch('WEB_URL')}/dashboard/settings/billing",
        metadata:     { organization_id: current_organization.id, plan: plan }
      )
      render json: { url: session.url }
    end

    def portal
      return render json: { error: "No billing account." }, status: :unprocessable_entity unless current_organization.stripe_customer_id

      session = Stripe::BillingPortal::Session.create(
        customer:   current_organization.stripe_customer_id,
        return_url: "#{ENV.fetch('WEB_URL')}/dashboard/settings/billing"
      )
      render json: { url: session.url }
    end

    private

    def current_organization
      @current_organization ||= Organization.find_by!(slug: params[:slug])
    end
  end
end
