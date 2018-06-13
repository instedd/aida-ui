class Session < ApplicationRecord
  belongs_to :user
  belongs_to :bot

  validates :user, presence: true
  validates :bot, presence: true
  validate :user_is_at_least_collaborator

  private

  def user_is_at_least_collaborator
    if user && bot
      if user != bot.owner and !bot.collaborating_users.include?(user)
        errors[:user] << "is not a collaborator"
      end
    end
  end
end
