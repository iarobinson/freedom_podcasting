class Organization < ApplicationRecord
  has_many :memberships, dependent: :destroy
  has_many :users, through: :memberships
  has_many :podcasts, dependent: :destroy
  has_many :media_files, dependent: :destroy
  has_many :podcast_imports, dependent: :destroy
  has_many :personal_access_tokens, dependent: :destroy
  has_many :invitations, dependent: :destroy

  PLANS = %w[free archive starter pro agency].freeze
  # archive: keeps an existing catalogue live — no new audio uploads or publishing.
  PLAN_LIMITS = {
    "free"    => { podcasts: 1,  episodes_per_month: 1,  members: 1,  storage_gb: 3   },
    "archive" => { podcasts: 1,  episodes_per_month: 0,  members: 1,  storage_gb: 3   },
    "starter" => { podcasts: 3,  episodes_per_month: -1, members: 3,  storage_gb: 15  },
    "pro"     => { podcasts: 10, episodes_per_month: -1, members: 10, storage_gb: 50  },
    "agency"  => { podcasts: -1, episodes_per_month: -1, members: -1, storage_gb: 200 },
  }.freeze

  validates :name, presence: true, length: { minimum: 2, maximum: 100 }
  validates :slug, presence: true, uniqueness: { case_sensitive: false },
                   format: { with: /\A[a-z0-9\-]+\z/ }, length: { minimum: 3, maximum: 50 }
  validates :plan, inclusion: { in: PLANS }
  validates :billing_interval, inclusion: { in: %w[month year] }

  before_validation :normalize_slug

  def owner = memberships.where(role: "owner").first&.user
  def plan_limits = PLAN_LIMITS[plan]
  def archive?    = plan == "archive"
  # Free and Archive pay per-episode for AI; active paid plans include it.
  def ai_included? = !%w[free archive].include?(plan)
  def storage_used_bytes = media_files.sum(:file_size)

  def at_podcast_limit?
    limit = plan_limits[:podcasts]
    limit != -1 && podcasts.count >= limit
  end

  def at_member_limit?
    limit = plan_limits[:members]
    limit != -1 && memberships.count >= limit
  end

  def at_monthly_publish_limit?
    limit = plan_limits[:episodes_per_month]
    return false if limit == -1
    Episode.joins(:podcast)
           .where(podcasts: { organization_id: id })
           .where(status: "published")
           .where(published_at: Time.current.beginning_of_month..)
           .count >= limit
  end

  private
  def normalize_slug
    self.slug = slug.to_s.downcase.strip.gsub(/[^a-z0-9\-]/, "-").gsub(/-+/, "-").gsub(/\A-|-\z/, "")
  end
end
