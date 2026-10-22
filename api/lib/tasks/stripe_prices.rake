namespace :stripe do
  # Creates the Archive + annual prices used by StripePrices. Idempotent: each
  # price has a lookup_key, so reruns reuse existing prices. Annual prices go on
  # the same product as the matching monthly price. Prints the fly command to
  # set the resulting price IDs (IDs are not secret).
  #
  #   fly ssh console -a freedom-podcasting-api -C "bin/rails stripe:create_prices"
  desc "Create Archive and annual Stripe prices"
  task create_prices: :environment do
    find_or_create = lambda do |lookup_key, product, cents, interval|
      Stripe::Price.list(lookup_keys: [lookup_key], active: true, limit: 1).data.first ||
        Stripe::Price.create(product: product, unit_amount: cents, currency: "usd",
                             recurring: { interval: interval }, lookup_key: lookup_key,
                             nickname: lookup_key.tr("_", " "))
    end
    product_of = ->(env) { Stripe::Price.retrieve(ENV.fetch(env)).product }

    archive = Stripe::Product.search(query: 'metadata["fp_plan"]:"archive"').data.first ||
              Stripe::Product.create(name: "Freedom Podcasting Archive", metadata: { fp_plan: "archive" })

    prices = {
      "STRIPE_ARCHIVE_PRICE_ID"        => find_or_create.("fp_archive_month", archive.id,                          500,   "month"),
      "STRIPE_ARCHIVE_ANNUAL_PRICE_ID" => find_or_create.("fp_archive_year",  archive.id,                          5000,  "year"),
      "STRIPE_STARTER_ANNUAL_PRICE_ID" => find_or_create.("fp_starter_year",  product_of.("STRIPE_STARTER_PRICE_ID"), 10000, "year"),
      "STRIPE_PRO_ANNUAL_PRICE_ID"     => find_or_create.("fp_pro_year",      product_of.("STRIPE_PRO_PRICE_ID"),     49000, "year"),
      "STRIPE_AGENCY_ANNUAL_PRICE_ID"  => find_or_create.("fp_agency_year",   product_of.("STRIPE_AGENCY_PRICE_ID"),  99000, "year"),
    }

    puts "livemode=#{prices.values.first.livemode}"
    puts "fly secrets set -a freedom-podcasting-api " + prices.map { |k, p| "#{k}=#{p.id}" }.join(" ")
  end
end
