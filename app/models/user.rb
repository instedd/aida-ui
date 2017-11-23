class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :omniauthable, :trackable

  has_many :identities, dependent: :destroy
  has_many :bots, foreign_key: :owner_id

  def display_name
    name || email
  end
end
