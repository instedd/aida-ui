class Invitation < ApplicationRecord
  belongs_to :bot

  validates_presence_of :token
  validates_inclusion_of :role, in: %w(collaborator)

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
end
