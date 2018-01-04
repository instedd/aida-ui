# Preview all emails at http://localhost:3000/rails/mailers/invitation_mailer
class InvitationMailerPreview < ActionMailer::Preview
  def invite_email
    bot = Bot.new(name: 'My Bot')
    creator = User.new(email: 'user@example.com')
    invitation = Invitation.new email: 'sample@example.com', bot: bot, creator: creator
    InvitationMailer.invite_email(invitation)
  end
end
