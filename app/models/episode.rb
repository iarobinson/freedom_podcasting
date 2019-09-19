class Episode < ApplicationRecord
  belongs_to :show
  has_one_attached :episode_art
end
