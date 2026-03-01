class MediaFile < ApplicationRecord
  belongs_to :organization
  belongs_to :episode, optional: true
  belongs_to :podcast, optional: true

  AUDIO_TYPES = %w[audio/mpeg audio/mp4 audio/ogg audio/wav audio/x-wav audio/flac].freeze
  IMAGE_TYPES = %w[image/jpeg image/png image/webp].freeze

  validates :filename, presence: true
  validates :content_type, presence: true
  validates :r2_key, presence: true, uniqueness: true
  validates :processing_status, inclusion: { in: %w[pending processing ready failed] }

  def public_url = StorageService.new.public_url(r2_key)
  def audio?     = AUDIO_TYPES.include?(content_type)
  def image?     = IMAGE_TYPES.include?(content_type)
end
