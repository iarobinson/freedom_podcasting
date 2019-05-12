class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniautha
  devise :database_authenticatable, :registerable,
        :recoverable, :rememberable, :validatable,
        :trackable

  has_one_attached :avatar
end
