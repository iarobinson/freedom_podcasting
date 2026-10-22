require "rails_helper"

RSpec.describe "Staff checkout links", type: :request do
  let(:staff) { create(:user, is_staff: true, staff_role: "admin") }
  let(:org)   { create(:organization) }

  around do |ex|
    old = ENV["FRONTEND_URL"]
    ENV["FRONTEND_URL"] = "http://localhost:3000"
    ex.run
  ensure
    ENV["FRONTEND_URL"] = old
  end

  def token_from(url) = url.split("/join/").last

  it "encodes plan and interval and exposes them on the public link" do
    post "/api/v1/staff/checkout_links",
         params: { org_slug: org.slug, price_cents: 9900, plan: "pro", interval: "year" }.to_json,
         headers: auth_headers_for(staff)
    expect(response).to have_http_status(:ok)

    get "/api/v1/public/checkout/#{token_from(response.parsed_body['url'])}"
    data = response.parsed_body["data"]
    expect(data).to include("plan" => "pro", "interval" => "year", "price_cents" => 9900)
  end

  it "rejects unknown plans" do
    post "/api/v1/staff/checkout_links",
         params: { org_slug: org.slug, price_cents: 9900, plan: "platinum" }.to_json,
         headers: auth_headers_for(staff)
    expect(response).to have_http_status(:unprocessable_entity)
  end

  it "defaults old tokens without plan to starter monthly" do
    token = JWT.encode({ org_slug: org.slug, price_cents: 500, exp: 1.day.from_now.to_i }, Rails.application.secret_key_base, "HS256")
    get "/api/v1/public/checkout/#{token}"
    expect(response.parsed_body["data"]).to include("plan" => "starter", "interval" => "month")
  end
end
