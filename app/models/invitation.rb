class Invitation < ApplicationRecord
  belongs_to :bot
  belongs_to :creator, class_name: "User"

  validates_presence_of :bot
  validates_presence_of :creator
  validates_presence_of :token
  validates_uniqueness_of :email, scope: :bot
  validates_inclusion_of :role, in: %w(collaborator)
  validate :email_is_not_already_collaborating
  validate :creator_is_at_least_collaborator

  after_initialize :init

  scope :non_anonymous, ->{ where.not(email: nil) }

  def anonymous?
    !email.present?
  end

  def self.generate_token
    SecureRandom.urlsafe_base64(20).tr('lIO0', 'sxyz')
  end

  def self.anonymous
    where(email: nil).first
  end

  def self.create_anonymous!(role)
    # this will work if called from the bot's invitations relation
    bot_id = scope_attributes['bot_id']
    creator = Bot.find(bot_id).owner if bot_id.present?
    create! role: role, creator: creator
  end

  private

  def init
    self.token ||= Invitation.generate_token
    self.role ||= "collaborator"
  end

  def email_is_not_already_collaborating
    if bot.present?
      if bot.collaborators.emails.include?(email)
        errors[:email] << "is already a collaborator"
      elsif bot.owner.email == email
        errors[:email] << "is the owner of the bot"
      end
    end
  end

  def creator_is_at_least_collaborator
    if creator.present? and bot.present?
      if creator != bot.owner and !bot.collaborating_users.include?(creator)
        errors[:creator] << "is not a collaborator"
      end
    end
  end
end
