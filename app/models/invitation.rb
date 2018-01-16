class Invitation < ApplicationRecord
  belongs_to :bot
  belongs_to :creator, class_name: "User"

  validates_presence_of :bot
  validates_presence_of :creator
  validates_presence_of :token
  validates_uniqueness_of :email, scope: :bot, unless: Proc.new { |i| i.email.blank? }
  validate :email_is_not_already_collaborating
  validate :creator_is_at_least_collaborator
  validate :roles_are_valid

  after_initialize :init

  scope :non_anonymous, ->{ where.not(email: nil) }
  scope :anonymous, ->{ where(email: nil) }

  def anonymous?
    !email.present?
  end

  def self.generate_token
    SecureRandom.urlsafe_base64(20).tr('lIO0', 'sxyz')
  end

  def self.create_anonymous!(token, roles, creator = nil)
    if creator.nil?
      # this will work if called from the bot's invitations relation
      bot_id = scope_attributes['bot_id']
      creator = Bot.find(bot_id).owner if bot_id.present?
    end
    create! token: token, roles: roles, creator: creator
  end

  private

  def init
    self.token ||= Invitation.generate_token
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

  def roles_are_valid
    if roles.blank?
      errors[:roles] << "cannot be blank"
    elsif !roles.all? { |role| Collaborator::ROLES.include?(role) }
      errors[:roles] << "contains an invalid value"
    end
  end
end
