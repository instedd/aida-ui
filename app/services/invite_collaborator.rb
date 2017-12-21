class InviteCollaborator
  def self.run(bot, email, role, creator = bot.owner)
    return nil unless email.present? and bot.present?
    invitation = bot.invitations.create creator: creator, email: email, role: role
    if invitation.valid?
      InvitationMailer.invite_email(invitation).deliver_later
    end
    invitation
  end
end
