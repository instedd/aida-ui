class InvitationMailer < ApplicationMailer
  include InvitationHelper

  def invite_email(invitation)
    @invitation = invitation
    @bot = invitation.bot
    @invitation_link = invitation_link_url(invitation)
    @inviter = invitation.creator.email
    @sign_up_link = Guisso.url + "/users/sign_up"

    mail(to: invitation.email, subject: "You have been invited to collaborate on Aida")
  end
end
