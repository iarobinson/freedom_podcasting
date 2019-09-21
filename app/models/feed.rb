class Feed < ApplicationRecord
  has_many :episodes, dependent: :destroy
  belongs_to :show
end
