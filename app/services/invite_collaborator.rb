class InviteCollaborator
  def self.run(bot, email, roles, creator = bot.owner)
    return nil unless email.present? and bot.present?
    invitation = bot.invitations.create creator: creator, email: email, roles: roles
    if invitation.valid?
      InvitationMailer.invite_email(invitation).deliver_later
    end
    invitation
  end
end
