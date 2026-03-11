class StripeWebhooksController < ActionController::Base
  protect_from_forgery with: :null_session

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
    if session.metadata["episode_id"].present?
      handle_episode_ai_purchase(session)
    else
      handle_subscription_checkout(session)
    end
  end

  def handle_episode_ai_purchase(session)
    episode = Episode.find_by(id: session.metadata["episode_id"])
    return unless episode
    episode.update!(
      ai_purchased_at:      Time.current,
      transcription_status: "pending",
      ai_metadata_status:   "pending"
    )
    TranscribeEpisodeJob.perform_later(episode.id)
  end

  def handle_subscription_checkout(session)
    org = Organization.find_by(id: session.metadata["organization_id"])
    return unless org
    org.update!(
      plan:                   session.metadata["plan"],
      stripe_customer_id:     session.customer,
      stripe_subscription_id: session.subscription
    )
  end

  def handle_subscription_updated(subscription)
    org = Organization.find_by(stripe_subscription_id: subscription.id) ||
          Organization.find_by(stripe_customer_id: subscription.customer)
    return unless org

    # Keep DB in sync with whichever sub ID Stripe is reporting
    org.update_column(:stripe_subscription_id, subscription.id) if org.stripe_subscription_id != subscription.id

    # Subscription scheduled for cancellation — revert to free immediately
    if subscription.cancel_at_period_end
      org.update!(plan: "free", stripe_subscription_id: nil)
      return
    end

    price_id = subscription.items.data.first&.price&.id
    plan     = PRICE_TO_PLAN[price_id]
    org.update!(plan: plan) if plan
  end

  def handle_subscription_deleted(subscription)
    org = Organization.find_by(stripe_subscription_id: subscription.id) ||
          Organization.find_by(stripe_customer_id: subscription.customer)
    return unless org
    org.update!(plan: "free", stripe_subscription_id: nil)
  end
end
