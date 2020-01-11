class Episode < ApplicationRecord
  has_one_attached :episode_art, dependent: :destroy
  has_one :invoice
  belongs_to :show
end
