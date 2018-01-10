class Collaborator < ApplicationRecord
  belongs_to :bot
  belongs_to :user

  validates_presence_of :user
  validates_presence_of :bot
  validates_uniqueness_of :user, scope: :bot_id
  validate :user_is_not_bot_owner
  validate :roles_are_valid

  ROLES = %w(publish behaviour content variables results)

  def self.add_collaborator!(user, params = {})
    create! params.merge(user: user)
  end

  def self.emails
    joins(:user).pluck('users.email')
  end

  private

  def user_is_not_bot_owner
    if user && bot && user.id == bot.owner_id
      errors[:user_id] << "is the owner of the bot"
    end
  end

  def roles_are_valid
    unless roles.blank? || roles.all? { |role| ROLES.include?(role) }
      errors[:roles] << "contains an invalid value"
    end
  end
end
