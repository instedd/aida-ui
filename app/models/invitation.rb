class Invitation < ApplicationRecord
  belongs_to :bot

  validates_presence_of :token
  validates_uniqueness_of :email, scope: :bot
  validates_inclusion_of :role, in: %w(collaborator)
  validate :email_is_not_already_collaborating

  after_initialize :init

  def anonymous?
    !email.present?
  end

  def self.generate_token
    SecureRandom.urlsafe_base64(20).tr('lIO0', 'sxyz')
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
end
