class StripeWebhooksController < ActionController::Base
  PRICE_TO_PLAN = {
    ENV["STRIPE_STARTER_PRICE_ID"] => "starter",
    ENV["STRIPE_PRO_PRICE_ID"]     => "pro",
    ENV["STRIPE_AGENCY_PRICE_ID"]  => "agency",
  }.freeze

  def receive
    payload    = request.body.read
    sig_header = request.env["HTTP_STRIPE_SIGNATURE"]

    event = Stripe::Webhook.construct_event(payload, sig_header, ENV.fetch("STRIPE_WEBHOOK_SECRET"))

    case event.type
    when "checkout.session.completed"
      handle_checkout_completed(event.data.object)
    when "customer.subscription.updated"
      handle_subscription_updated(event.data.object)
    when "customer.subscription.deleted"
      handle_subscription_deleted(event.data.object)
    end

    render json: { received: true }
  rescue Stripe::SignatureVerificationError
    render json: { error: "Invalid signature." }, status: :bad_request
  end

  private

  def handle_checkout_completed(session)
    org = Organization.find_by(id: session.metadata["organization_id"])
    return unless org
    org.update!(
      plan:                    session.metadata["plan"],
      stripe_customer_id:      session.customer,
      stripe_subscription_id:  session.subscription
    )
  end

  def handle_subscription_updated(subscription)
    org = Organization.find_by(stripe_subscription_id: subscription.id)
    return unless org
    price_id = subscription.items.data.first&.price&.id
    plan     = PRICE_TO_PLAN[price_id]
    org.update!(plan: plan) if plan
  end

  def handle_subscription_deleted(subscription)
    org = Organization.find_by(stripe_subscription_id: subscription.id)
    return unless org
    org.update!(plan: "free", stripe_subscription_id: nil)
  end
end
