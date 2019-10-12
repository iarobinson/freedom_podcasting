class Show < ApplicationRecord
  before_create :sync_to_podcast_feed
  has_and_belongs_to_many :users
  has_one_attached :show_art, dependent: :destroy
  has_many :episodes, dependent: :destroy
end
