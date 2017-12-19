class InvitationMailer < ApplicationMailer
  def invite_email(invitation)
    @invitation = invitation
    @bot = invitation.bot
    @invitation_link = invitation_url(token: invitation.token)

    mail(to: invitation.email, subject: "You have been invited to collaborate on Aida")
  end
end
