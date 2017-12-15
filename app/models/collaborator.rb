class Collaborator < ApplicationRecord
  belongs_to :bot
  belongs_to :user

  validates_uniqueness_of :user, scope: :bot_id
  validates_inclusion_of :role, in: %w(collaborator)
  validate :user_is_not_bot_owner

  private

  def user_is_not_bot_owner
    if user.id == bot.owner_id
      errors[:user_id] << "is the owner of the bot"
    end
  end
end
