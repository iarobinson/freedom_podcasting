class Show < ApplicationRecord
  has_many :episodes, dependent: :destroy
end
