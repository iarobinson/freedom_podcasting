class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher

  devise :database_authenticatable, :registerable, :recoverable,
         :validatable, :confirmable, :jwt_authenticatable, jwt_revocation_strategy: self

  STAFF_ROLES = %w[admin editor].freeze

  validates :staff_role, inclusion: { in: STAFF_ROLES }, allow_nil: true

  # Non-blocking: allow login before email is verified (banner nudges instead)
  def confirmation_required? = false

  # Devise sends confirmation via deliver_now (blocks the request thread).
  # We handle this ourselves in RegistrationsController via UserMailer.deliver_later.
  def send_on_create_confirmation_instructions; end

  # Public wrapper: generate token (protected in Devise) then enqueue email async.
  def send_confirmation_email!
    generate_confirmation_token!
    UserMailer.verification_email(self).deliver_later
  end

  has_many :memberships, dependent: :destroy
  has_many :organizations, through: :memberships
  has_many :personal_access_tokens, dependent: :destroy

  validates :first_name, presence: true, length: { maximum: 100 }
  validates :last_name,  presence: true, length: { maximum: 100 }

  def full_name = "#{first_name} #{last_name}".strip
  def owner_of?(org) = memberships.exists?(organization: org, role: "owner")
  def role_in(org)   = memberships.find_by(organization: org)&.role

  # Staff helpers
  def staff? = is_staff?

  # Returns a real membership if one exists, otherwise a virtual (unsaved) one
  # for staff users so that require_organization_membership! works transparently.
  def membership_for(org)
    memberships.find_by(organization: org) ||
      (staff? ? Membership.new(user: self, organization: org, role: staff_role) : nil)
  end
end
