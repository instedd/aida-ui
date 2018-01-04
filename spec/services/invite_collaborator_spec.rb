require 'rails_helper'

RSpec.describe InviteCollaborator, type: :service do
  let(:user) { create(:user) }
  let(:bot) { create(:bot, owner: user) }
  let(:email) { generate(:email) }
  let(:role) { 'collaborator' }

  before(:each) {
    clear_mail_deliveries
  }

  it "creates a new invitation record" do
    expect do
      InviteCollaborator.run(bot, email, role)
    end.to change(bot.invitations, :count).by(1)
  end

  it "returns the new invitation" do
    invitation = InviteCollaborator.run(bot, email, role)
    expect(invitation).to_not be_nil
    expect(invitation).to be_an(Invitation)
    expect(invitation).to be_valid
    expect(invitation.bot_id).to eq(bot.id)
    expect(invitation.email).to eq(email)
  end

  it "sends an email to the recipient" do
    InviteCollaborator.run(bot, email, role)
    expect(all_mail_deliveries.size).to eq(1)
    expect(all_mail_destinations).to include(email)
  end

  it "rejects already invited emails" do
    create(:invitation, bot: bot, email: email)

    invitation = InviteCollaborator.run(bot, email, role)
    expect(invitation).to_not be_valid
    expect(invitation.errors[:email]).to be_present
  end

  it "rejects emails for existing collaborators" do
    collaborator = create(:user)
    bot.collaborators.add_collaborator!(collaborator)

    invitation = InviteCollaborator.run(bot, collaborator.email, role)
    expect(invitation).to_not be_valid
    expect(invitation.errors[:email]).to be_present
  end

  it "rejects emails for owner" do
    invitation = InviteCollaborator.run(bot, bot.owner.email, role)
    expect(invitation).to_not be_valid
    expect(invitation.errors[:email]).to be_present
  end

  it "validates email is present" do
    invitation = InviteCollaborator.run(bot, nil, role)
    expect(invitation).to be_nil
  end

  it "validates given role" do
    invitation = InviteCollaborator.run(bot, email, 'invalid-role')
    expect(invitation).to_not be_valid
    expect(invitation.errors[:role]).to be_present
  end

  it "does not send email if any parameter is not valid" do
    InviteCollaborator.run(bot, email, 'invalid-role')
    expect(all_mail_deliveries).to be_empty
  end

  describe "creator" do
    let!(:creator) { create(:user) }

    it "validates that is (at least) a collaborator" do
      invitation = InviteCollaborator.run(bot, email, role, creator)
      expect(invitation).to_not be_valid
      expect(invitation.errors[:creator]).to be_present
    end

    it "is set on the invitation" do
      bot.collaborators.add_collaborator! creator

      invitation = InviteCollaborator.run(bot, email, role, creator)
      expect(invitation).to be_valid
      expect(invitation.creator).to eq(creator)
    end

    it "is the bot owner by default" do
      invitation = InviteCollaborator.run(bot, email, role)
      expect(invitation).to be_valid
      expect(invitation.creator).to eq(bot.owner)
    end

    it "cannot be nil" do
      invitation = InviteCollaborator.run(bot, email, role, nil)
      expect(invitation).to_not be_valid
      expect(invitation.errors[:creator]).to be_present
    end
  end
end
