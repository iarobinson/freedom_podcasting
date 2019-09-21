class Show < ApplicationRecord
  has_and_belongs_to_many :users
  has_many :episodes

  has_one_attached :show_art
end
