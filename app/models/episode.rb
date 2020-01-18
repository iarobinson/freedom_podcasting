class Episode < ApplicationRecord
  has_one_attached :episode_art, dependent: :destroy
  has_rich_text :content_encoded
  has_one :invoice
  belongs_to :show
end
