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

      # Resolve subscription ID: stored value first, then look up by customer
      # (handles race condition where webhook hasn't fired yet after checkout)
      sub_id = current_organization.stripe_subscription_id
      if sub_id.nil? && current_organization.stripe_customer_id.present?
        existing = Stripe::Subscription.list(
          customer: current_organization.stripe_customer_id,
          status:   "active",
          limit:    1
        ).data.first
        if existing
          sub_id = existing.id
          current_organization.update_column(:stripe_subscription_id, sub_id)
        end
      end

      if sub_id
        # Already subscribed — update the existing subscription in place
        subscription = Stripe::Subscription.retrieve(sub_id)
        Stripe::Subscription.update(
          sub_id,
          items: [{ id: subscription.items.data.first.id, price: price_id }],
          metadata: { organization_id: current_organization.id, plan: plan },
          proration_behavior: "create_prorations"
        )
        current_organization.update!(plan: plan)
        render json: { url: nil }
      else
        # New subscriber — create a Stripe Checkout session
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
