class PodcastImport < ApplicationRecord
  belongs_to :organization
  belongs_to :podcast, optional: true

  validates :rss_url, presence: true
  validates :status, inclusion: { in: %w[pending processing done failed] }
end
