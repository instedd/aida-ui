class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :omniauthable, :trackable

  has_many :identities, dependent: :destroy

  def display_name
    name || email
  end
end
