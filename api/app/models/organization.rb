class Organization < ApplicationRecord
  has_many :memberships, dependent: :destroy
  has_many :users, through: :memberships
  has_many :podcasts, dependent: :destroy
  has_many :media_files, dependent: :destroy

  PLANS = %w[free starter pro agency].freeze
  PLAN_LIMITS = {
    "free"    => { podcasts: 1,  episodes_per_month: 10,  storage_gb: 1 },
    "starter" => { podcasts: 3,  episodes_per_month: 50,  storage_gb: 10 },
    "pro"     => { podcasts: 10, episodes_per_month: 200, storage_gb: 50 },
    "agency"  => { podcasts: -1, episodes_per_month: -1,  storage_gb: 200 },
  }.freeze

  validates :name, presence: true, length: { minimum: 2, maximum: 100 }
  validates :slug, presence: true, uniqueness: { case_sensitive: false },
                   format: { with: /\A[a-z0-9\-]+\z/ }, length: { minimum: 3, maximum: 50 }
  validates :plan, inclusion: { in: PLANS }

  before_validation :normalize_slug

  def owner = memberships.where(role: "owner").first&.user
  def plan_limits = PLAN_LIMITS[plan]

  private
  def normalize_slug
    self.slug = slug.to_s.downcase.strip.gsub(/[^a-z0-9\-]/, "-").gsub(/-+/, "-").gsub(/\A-|-\z/, "")
  end
end
