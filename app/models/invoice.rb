class Invoice < ApplicationRecord
  has_and_belongs_to_many :users
  has_and_belongs_to_many :episodes
end
