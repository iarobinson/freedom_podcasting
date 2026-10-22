# Maps (plan, interval) <-> Stripe price IDs. Price IDs come from env so test
# and live mode can use different prices.
module StripePrices
  INTERVALS = %w[month year].freeze

  def self.table
    {
      ["archive", "month"] => ENV["STRIPE_ARCHIVE_PRICE_ID"],
      ["archive", "year"]  => ENV["STRIPE_ARCHIVE_ANNUAL_PRICE_ID"],
      ["starter", "month"] => ENV["STRIPE_STARTER_PRICE_ID"],
      ["starter", "year"]  => ENV["STRIPE_STARTER_ANNUAL_PRICE_ID"],
      ["pro",     "month"] => ENV["STRIPE_PRO_PRICE_ID"],
      ["pro",     "year"]  => ENV["STRIPE_PRO_ANNUAL_PRICE_ID"],
      ["agency",  "month"] => ENV["STRIPE_AGENCY_PRICE_ID"],
      ["agency",  "year"]  => ENV["STRIPE_AGENCY_ANNUAL_PRICE_ID"],
    }
  end

  def self.price_id(plan, interval) = table[[plan, interval]].presence

  # => ["pro", "year"] or nil
  def self.plan_for(price_id)
    return nil if price_id.blank?
    table.find { |_, id| id == price_id }&.first
  end
end
