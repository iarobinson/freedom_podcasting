class Episode < ApplicationRecord
  belongs_to :podcast
  belongs_to :reviewed_by, class_name: "User", optional: true
  has_many :media_files, dependent: :nullify

  EPISODE_TYPES = %w[full trailer bonus].freeze
  STATUSES      = %w[draft review approved scheduled published].freeze

  AI_PLACEHOLDER_TITLE = "Untitled Episode"

  validates :episode_type, inclusion: { in: EPISODE_TYPES }
  validates :status,       inclusion: { in: STATUSES }
  validates :audio_url,    presence: true, if: :published?
  validates :published_at, presence: true, if: :published?
  validates :slug, format: { with: /\A[a-z0-9\-]+\z/, message: "only lowercase letters, numbers, and hyphens" }, allow_nil: true
  validates :slug, uniqueness: { scope: :podcast_id }, allow_nil: true

  before_validation :assign_guid, :normalize_slug
  before_create     :set_episode_number, :set_defaults

  scope :published,  -> { where(status: "published").where("published_at <= ?", Time.current) }
  scope :draft,      -> { where(status: "draft") }
  scope :in_review,  -> { where(status: "review") }
  scope :approved,   -> { where(status: "approved") }
  scope :by_date,    -> { order(published_at: :desc) }

  def published? = status == "published"
  def in_review? = status == "review"
  def approved?  = status == "approved"

  def formatted_duration
    return nil unless audio_duration_seconds
    total = audio_duration_seconds.to_i
    h, m, s = total / 3600, (total % 3600) / 60, total % 60
    format("%02d:%02d:%02d", h, m, s)
  end

  def itunes_duration = audio_duration_seconds&.to_i

  private

  def set_defaults
    self.title       = AI_PLACEHOLDER_TITLE if title.blank?
    self.description = ""                   if description.blank?
  end

  def assign_guid = self.guid ||= SecureRandom.uuid

  def normalize_slug
    return if slug.blank?
    self.slug = slug.strip.downcase.gsub(/[\s_]+/, "-").gsub(/[^a-z0-9\-]/, "")
    self.slug = nil if self.slug.blank?
  end
  def set_episode_number
    return if episode_number.present?
    self.episode_number = (podcast.episodes.maximum(:episode_number) || 0) + 1
  end
end
