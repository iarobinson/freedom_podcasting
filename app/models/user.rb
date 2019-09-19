class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  # Set roles and assign new people to stranger roles unless specified
  after_initialize :set_default_role, :if => :new_record?
  enum role: [:administrator, :producer, :client, :stranger]
  def set_default_role
    self.role ||= :stranger
  end

  has_and_belongs_to_many :shows
  has_one_attached :avatar
end
