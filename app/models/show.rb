class Show < ApplicationRecord
  belongs_to :client
  has_many :producers
end
