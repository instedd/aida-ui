require 'rails_helper'

RSpec.describe AcceptInvitation, type: :service do
  let!(:bot) { create(:bot) }
  let!(:user) { create(:user) }

  describe "directed invitations" do
    let!(:invitation) { create(:invitation, bot: bot, email: user.email) }

    it "removes the invitation record" do
      expect do
        AcceptInvitation.run(invitation, user)
      end.to change(Invitation, :count).by(-1)

      expect(invitation).to be_destroyed
    end

    it "creates a new collaborator record" do
      expect do
        AcceptInvitation.run(invitation, user)
      end.to change(bot.collaborators, :count).by(1)
    end

    it "returns the collaborator" do
      collaborator = AcceptInvitation.run(invitation, user)
      expect(collaborator).to be_a(Collaborator)
      expect(collaborator).to be_valid
      expect(collaborator.user).to eq(user)
      expect(collaborator.bot).to eq(bot)
      expect(collaborator.roles).to eq(invitation.roles)
    end

    it "rejects if the email does not match" do
      invitation = create(:invitation, bot: bot)
      expect do
        AcceptInvitation.run(invitation, user)
      end.to raise_error(/user does not match/)
      expect(invitation).to_not be_destroyed
      expect(bot.collaborators.emails).to_not include(user.email)
    end
  end

  describe "anonymous invitations" do
    let!(:invitation) { create(:invitation, :anonymous, bot: bot) }

    it "removes the invitation record" do
      expect do
        AcceptInvitation.run(invitation, user)
      end.to change(Invitation, :count).by(-1)

      expect(invitation).to be_destroyed
    end

    it "creates a new collaborator record" do
      expect do
        AcceptInvitation.run(invitation, user)
      end.to change(bot.collaborators, :count).by(1)
    end

    it "returns the collaborator" do
      collaborator = AcceptInvitation.run(invitation, user)
      expect(collaborator).to be_a(Collaborator)
      expect(collaborator.user).to eq(user)
      expect(collaborator.bot).to eq(bot)
      expect(collaborator.roles).to eq(invitation.roles)
    end

    it "fails if the user is already a collaborator" do
      bot.collaborators.add_collaborator! user
      expect do
        AcceptInvitation.run(invitation, user)
      end.to raise_error(ActiveRecord::RecordInvalid)
      expect(invitation).to_not be_destroyed
    end
  end
end
