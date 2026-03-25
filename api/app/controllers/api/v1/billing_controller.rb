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
        customer_id = current_organization.stripe_customer_id.presence
        begin
          session = Stripe::Checkout::Session.create(
            mode:                  "subscription",
            customer:              customer_id,
            line_items:            [{ price: price_id, quantity: 1 }],
            allow_promotion_codes: true,
            success_url:           "#{ENV.fetch('WEB_URL')}/dashboard/settings/billing?success=true",
            cancel_url:            "#{ENV.fetch('WEB_URL')}/dashboard/settings/billing",
            metadata:              { organization_id: current_organization.id, plan: plan }
          )
        rescue Stripe::InvalidRequestError
          # Stale customer ID — retry without it so Stripe creates a fresh customer
          current_organization.update_columns(stripe_customer_id: nil, stripe_subscription_id: nil)
          session = Stripe::Checkout::Session.create(
            mode:                  "subscription",
            line_items:            [{ price: price_id, quantity: 1 }],
            customer_email:        current_organization.owner&.email,
            allow_promotion_codes: true,
            success_url:           "#{ENV.fetch('WEB_URL')}/dashboard/settings/billing?success=true",
            cancel_url:            "#{ENV.fetch('WEB_URL')}/dashboard/settings/billing",
            metadata:              { organization_id: current_organization.id, plan: plan }
          )
        end
        render json: { url: session.url }
      end
    end

    def portal
      return render json: { error: "No billing account." }, status: :unprocessable_entity unless current_organization.stripe_customer_id

      begin
        session = Stripe::BillingPortal::Session.create(
          customer:   current_organization.stripe_customer_id,
          return_url: "#{ENV.fetch('WEB_URL')}/dashboard/settings/billing?portal_return=true"
        )
        render json: { url: session.url }
      rescue Stripe::InvalidRequestError
        # Stored customer ID is stale (e.g. created under a different API key).
        # Create a fresh customer and retry once.
        customer = Stripe::Customer.create(
          email:    current_organization.owner&.email,
          name:     current_organization.name,
          metadata: { organization_id: current_organization.id }
        )
        current_organization.update_columns(
          stripe_customer_id:     customer.id,
          stripe_subscription_id: nil
        )
        session = Stripe::BillingPortal::Session.create(
          customer:   customer.id,
          return_url: "#{ENV.fetch('WEB_URL')}/dashboard/settings/billing?portal_return=true"
        )
        render json: { url: session.url }
      end
    end

    def cancel
      sub_id = current_organization.stripe_subscription_id
      return render json: { error: "No active subscription." }, status: :unprocessable_entity unless sub_id

      Stripe::Subscription.cancel(sub_id)
      current_organization.update!(plan: "free", stripe_subscription_id: nil)
      render json: { cancelled: true }
    end

    private

    def current_organization
      @current_organization ||= Organization.find_by!(slug: params[:slug])
    end
  end
end
