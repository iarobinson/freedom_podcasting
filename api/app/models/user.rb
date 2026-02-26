class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher

  devise :database_authenticatable, :registerable, :recoverable,
         :validatable, :jwt_authenticatable, jwt_revocation_strategy: self

  has_many :memberships, dependent: :destroy
  has_many :organizations, through: :memberships

  validates :first_name, presence: true, length: { maximum: 100 }
  validates :last_name,  presence: true, length: { maximum: 100 }

  def full_name = "#{first_name} #{last_name}".strip
  def owner_of?(org) = memberships.exists?(organization: org, role: "owner")
  def role_in(org)   = memberships.find_by(organization: org)&.role
end
