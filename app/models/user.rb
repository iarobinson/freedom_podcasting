class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniautha
  devise :database_authenticatable, :registerable,
  :recoverable, :rememberable, :validatable

  has_many :shows
  has_one_attached :avatar
  has_and_belongs_to_many :shows
end
