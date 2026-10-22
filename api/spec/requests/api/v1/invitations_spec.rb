require "rails_helper"

RSpec.describe "Pending invitations", type: :request do
  let(:owner)   { create(:user) }
  let(:org)     { create(:organization, plan: "pro") }
  let!(:_mbr)   { create(:membership, user: owner, organization: org, role: "owner") }
  let(:headers) { auth_headers_for(owner) }
  let(:base)    { "/api/v1/organizations/#{org.slug}" }

  def invite(email, role = "editor")
    post "#{base}/invite", params: { email: email, role: role }.to_json, headers: headers
  end

  it "lists invites for both new and existing users" do
    existing = create(:user)
    invite("new@example.com")
    invite(existing.email, "viewer")

    get "#{base}/invitations", headers: headers
    expect(response).to have_http_status(:ok)
    emails = response.parsed_body["data"].map { |r| r["email"] }
    expect(emails).to contain_exactly("new@example.com", existing.email)
  end

  it "re-inviting the same new email updates one row instead of duplicating" do
    invite("new@example.com")
    invite("new@example.com", "admin")
    expect(org.invitations.count).to eq(1)
    expect(org.invitations.first.role).to eq("admin")
  end

  it "resends an invite" do
    invite("new@example.com")
    post "#{base}/invitations/resend", params: { email: "new@example.com" }.to_json, headers: headers
    expect(response).to have_http_status(:ok)
  end

  it "revokes a new-user invite so its token can no longer be accepted" do
    invite("new@example.com")
    token = org.invitations.first.signed_token
    delete "#{base}/invitations", params: { email: "new@example.com" }.to_json, headers: headers
    expect(response).to have_http_status(:ok)

    newbie = create(:user, email: "new@example.com")
    post "/api/v1/invitations/accept", params: { token: token }.to_json, headers: auth_headers_for(newbie)
    expect(response).to have_http_status(:gone)
    expect(org.memberships.where(user: newbie)).to be_empty
  end

  it "accepting a new-user invite consumes the invitation row" do
    invite("new@example.com")
    token = org.invitations.first.signed_token
    newbie = create(:user, email: "new@example.com")
    post "/api/v1/invitations/accept", params: { token: token }.to_json, headers: auth_headers_for(newbie)
    expect(response).to have_http_status(:ok)
    expect(org.invitations.count).to eq(0)
    expect(org.memberships.find_by(user: newbie).role).to eq("editor")
  end

  it "revokes an existing-user invite by removing the pending membership" do
    existing = create(:user)
    invite(existing.email)
    delete "#{base}/invitations", params: { email: existing.email }.to_json, headers: headers
    expect(response).to have_http_status(:ok)
    expect(org.memberships.where(user: existing)).to be_empty
  end

  it "forbids editors from listing invites" do
    editor = create(:user)
    create(:membership, user: editor, organization: org, role: "editor")
    get "#{base}/invitations", headers: auth_headers_for(editor)
    expect(response).to have_http_status(:forbidden)
  end
end
