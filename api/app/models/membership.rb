class Membership < ApplicationRecord
  belongs_to :user
  belongs_to :organization

  ROLES = %w[owner admin editor viewer].freeze

  validates :role, inclusion: { in: ROLES }
  validates :user_id, uniqueness: { scope: :organization_id }

  def can_edit?   = %w[owner admin editor].include?(role)
  def can_manage? = %w[owner admin].include?(role)
end
