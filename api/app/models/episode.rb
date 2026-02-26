class Episode < ApplicationRecord
  belongs_to :podcast
  has_many :media_files, dependent: :nullify

  EPISODE_TYPES = %w[full trailer bonus].freeze
  STATUSES      = %w[draft scheduled published].freeze

  validates :title, presence: true
  validates :description, presence: true
  validates :episode_type, inclusion: { in: EPISODE_TYPES }
  validates :status, inclusion: { in: STATUSES }
  validates :guid, presence: true, uniqueness: true
  validates :audio_url, presence: true, if: :published?
  validates :published_at, presence: true, if: :published?

  before_create :assign_guid
  before_create :set_episode_number

  scope :published, -> { where(status: "published").where("published_at <= ?", Time.current) }
  scope :draft,     -> { where(status: "draft") }
  scope :by_date,   -> { order(published_at: :desc) }

  def published? = status == "published"

  def formatted_duration
    return nil unless audio_duration_seconds
    total = audio_duration_seconds.to_i
    h, m, s = total / 3600, (total % 3600) / 60, total % 60
    format("%02d:%02d:%02d", h, m, s)
  end

  def itunes_duration = audio_duration_seconds&.to_i

  private
  def assign_guid   = self.guid ||= SecureRandom.uuid
  def set_episode_number
    return if episode_number.present?
    self.episode_number = (podcast.episodes.maximum(:episode_number) || 0) + 1
  end
end
