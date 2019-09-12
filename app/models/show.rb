class Show < ApplicationRecord
  has_and_belongs_to_many :episodes, dependent: :destroy
  has_and_belongs_to_many :users
end
