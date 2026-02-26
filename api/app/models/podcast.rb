class Podcast < ApplicationRecord
  belongs_to :organization
  has_many :episodes, dependent: :destroy
  has_many :media_files, dependent: :nullify

  validates :title, presence: true
  validates :description, presence: true
  validates :author, presence: true
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :slug, presence: true, uniqueness: { case_sensitive: false },
                   format: { with: /\A[a-z0-9\-]+\z/ }
  validates :podcast_type, inclusion: { in: %w[episodic serial] }

  before_validation :normalize_slug
  before_create :generate_rss_token

  scope :published, -> { where(published: true) }

  def published_episodes = episodes.published.order(published_at: :desc)

  def rss_url
    Rails.application.routes.url_helpers.public_rss_feed_url(
      podcast_slug: slug,
      host: ENV.fetch("API_HOST", "api.freedompodcasting.com")
    )
  end

  private
  def normalize_slug
    self.slug = slug.to_s.downcase.strip.gsub(/\s+/, "-").gsub(/[^a-z0-9\-]/, "").gsub(/-+/, "-")
  end
  def generate_rss_token
    self.rss_token = SecureRandom.urlsafe_base64(24)
  end
end
