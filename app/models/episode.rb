class Episode < ApplicationRecord
  has_one_attached :episode_art
  belongs_to :show
  belongs_to :feed
end
