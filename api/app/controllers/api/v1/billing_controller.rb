module Api::V1
  class BillingController < ApplicationController
    before_action :current_organization
    before_action :require_organization_membership!
    before_action :require_org_owner!

    def summary
      org    = current_organization
      limits = org.plan_limits
      renews_at = nil
      if org.stripe_subscription_id.present?
        begin
          sub = Stripe::Subscription.retrieve(org.stripe_subscription_id)
          period_end = sub.respond_to?(:current_period_end) ? sub.current_period_end : sub.items.data.first&.current_period_end
          renews_at = Time.at(period_end).utc.iso8601 if period_end
        rescue Stripe::StripeError => e
          Rails.logger.warn "Billing summary: could not load subscription #{org.stripe_subscription_id}: #{e.message}"
        end
      end

      render json: {
        data: {
          plan:             org.plan,
          billing_interval: org.billing_interval,
          renews_at:        renews_at,
          usage: {
            podcasts:      { used: org.podcasts.count,   limit: limits[:podcasts] },
            members:       { used: org.memberships.count, limit: limits[:members] },
            storage_bytes: { used: org.storage_used_bytes, limit: limits[:storage_gb] * 1024**3 },
          },
        },
      }
    end

    def checkout
      plan     = params[:plan]
      interval = StripePrices::INTERVALS.include?(params[:interval]) ? params[:interval] : "month"
      price_id = StripePrices.price_id(plan, interval)
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
          metadata: { organization_id: current_organization.id, plan: plan, interval: interval },
          proration_behavior: "create_prorations"
        )
        current_organization.update!(plan: plan, billing_interval: interval)
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
            metadata:              { organization_id: current_organization.id, plan: plan, interval: interval }
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
            metadata:              { organization_id: current_organization.id, plan: plan, interval: interval }
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
      current_organization.update!(plan: "free", billing_interval: "month", stripe_subscription_id: nil)
      render json: { cancelled: true }
    end

    private

    def current_organization
      @current_organization ||= Organization.find_by!(slug: params[:slug])
    end

    # Billing requires a real ownership row — staff virtual memberships are not
    # sufficient. This prevents staff from accidentally modifying client billing.
    def require_org_owner!
      is_owner = current_organization.memberships.exists?(user: current_user, role: "owner")
      render_forbidden unless is_owner
    end
  end
end
