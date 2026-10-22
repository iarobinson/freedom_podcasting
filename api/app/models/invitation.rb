class Invitation < ApplicationRecord
  TTL = 7.days

  belongs_to :organization
  belongs_to :invited_by, class_name: "User", optional: true

  validates :email, presence: true, uniqueness: { scope: :organization_id, case_sensitive: false }
  validates :role, inclusion: { in: Membership::ROLES - ["owner"] }

  scope :active, -> { where("expires_at > ?", Time.current) }

  # Signed token for the register link. Carries the invitation id so the
  # invite can be revoked by deleting the row.
  def signed_token
    payload = {
      invitation_id: id,
      org_id:        organization_id,
      org_name:      organization.name,
      email:         email,
      role:          role,
      invited_by:    invited_by_id,
      exp:           expires_at.to_i,
    }
    JWT.encode(payload, Rails.application.secret_key_base, "HS256")
  end
end
