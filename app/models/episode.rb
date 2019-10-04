class Episode < ApplicationRecord
  has_one_attached :episode_art, dependent: :destroy
  belongs_to :show
end
