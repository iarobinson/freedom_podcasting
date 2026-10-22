require "rails_helper"

RSpec.describe "Billing summary", type: :request do
  let(:user)  { create(:user) }
  let(:org)   { create(:organization, plan: "starter", billing_interval: "year") }
  let!(:_mbr) { create(:membership, user: user, organization: org, role: "owner") }

  it "returns plan, interval, and usage against limits for the owner" do
    create(:podcast, organization: org)
    get "/api/v1/organizations/#{org.slug}/billing/summary", headers: auth_headers_for(user)

    expect(response).to have_http_status(:ok)
    data = response.parsed_body["data"]
    expect(data["plan"]).to eq("starter")
    expect(data["billing_interval"]).to eq("year")
    expect(data["usage"]["podcasts"]).to eq("used" => 1, "limit" => 3)
    expect(data["usage"]["members"]).to eq("used" => 1, "limit" => 3)
    expect(data["usage"]["storage_bytes"]["limit"]).to eq(15 * 1024**3)
  end

  it "forbids non-owners" do
    editor = create(:user)
    create(:membership, user: editor, organization: org, role: "editor")
    get "/api/v1/organizations/#{org.slug}/billing/summary", headers: auth_headers_for(editor)
    expect(response).to have_http_status(:forbidden)
  end
end

RSpec.describe StripePrices do
  around do |ex|
    old = ENV.slice("STRIPE_PRO_ANNUAL_PRICE_ID")
    ENV["STRIPE_PRO_ANNUAL_PRICE_ID"] = "price_pro_year"
    ex.run
  ensure
    ENV.delete("STRIPE_PRO_ANNUAL_PRICE_ID")
    ENV.update(old)
  end

  it "maps price IDs both ways" do
    expect(described_class.price_id("pro", "year")).to eq("price_pro_year")
    expect(described_class.plan_for("price_pro_year")).to eq(["pro", "year"])
    expect(described_class.plan_for(nil)).to be_nil
  end
end
