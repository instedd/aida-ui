class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :omniauthable, :trackable

  has_many :identities, dependent: :destroy
  has_many :bots, foreign_key: :owner_id, inverse_of: :owner
  has_many :collaborations, class_name: 'Collaborator', dependent: :destroy
  has_many :invitations, foreign_key: :creator_id, dependent: :destroy, inverse_of: :creator

  def display_name
    name || email
  end
end
