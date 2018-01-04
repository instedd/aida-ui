class ResendInvitation
  def self.run(invitation)
    return if invitation.anonymous?
    InvitationMailer.invite_email(invitation).deliver_later
  end
end
