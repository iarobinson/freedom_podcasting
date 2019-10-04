class Show < ApplicationRecord
  has_and_belongs_to_many :users
  has_many :episodes, dependent: :destroy

  has_one_attached :show_art, dependent: :destroy

end
