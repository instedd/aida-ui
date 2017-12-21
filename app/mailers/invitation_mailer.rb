class InvitationMailer < ApplicationMailer
  include InvitationHelper

  def invite_email(invitation)
    @invitation = invitation
    @bot = invitation.bot
    @invitation_link = invitation_link_url(invitation)

    mail(to: invitation.email, subject: "You have been invited to collaborate on Aida")
  end
end
