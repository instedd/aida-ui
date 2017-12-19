class Collaborator < ApplicationRecord
  belongs_to :bot
  belongs_to :user

  validates_presence_of :user
  validates_presence_of :bot
  validates_uniqueness_of :user, scope: :bot_id
  validates_inclusion_of :role, in: %w(collaborator)
  validate :user_is_not_bot_owner

  def self.add_collaborator!(user, params = {})
    default_params = { role: 'collaborator' }

    create! default_params.merge(params).merge(user: user)
  end

  private

  def user_is_not_bot_owner
    if user && bot && user.id == bot.owner_id
      errors[:user_id] << "is the owner of the bot"
    end
  end
end
