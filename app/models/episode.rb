class Episode < ApplicationRecord
  has_one :invoice
  belongs_to :show
  has_one_attached :enclosed_audio, dependent: :destroy
  has_one_attached :episode_art, dependent: :destroy
  has_rich_text :content_encoded
end
