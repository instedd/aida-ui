require 'rails_helper'

RSpec.describe InviteCollaborator, type: :service do
  let(:user) { create(:user) }
  let(:bot) { create(:bot, owner: user) }
  let(:email) { generate(:email) }
  let(:roles) { %w(results) }

  before(:each) {
    clear_mail_deliveries
  }

  it "creates a new invitation record" do
    expect do
      InviteCollaborator.run(bot, email, roles)
    end.to change(bot.invitations, :count).by(1)
  end

  it "returns the new invitation" do
    invitation = InviteCollaborator.run(bot, email, roles)
    expect(invitation).to_not be_nil
    expect(invitation).to be_an(Invitation)
    expect(invitation).to be_valid
    expect(invitation.bot_id).to eq(bot.id)
    expect(invitation.email).to eq(email)
  end

  it "sends an email to the recipient" do
    InviteCollaborator.run(bot, email, roles)
    expect(all_mail_deliveries.size).to eq(1)
    expect(all_mail_destinations).to include(email)
  end

  it "rejects already invited emails" do
    create(:invitation, bot: bot, email: email)

    invitation = InviteCollaborator.run(bot, email, roles)
    expect(invitation).to_not be_valid
    expect(invitation.errors[:email]).to be_present
  end

  it "rejects emails for existing collaborators" do
    collaborator = create(:user)
    bot.collaborators.add_collaborator!(collaborator, roles: roles)

    invitation = InviteCollaborator.run(bot, collaborator.email, roles)
    expect(invitation).to_not be_valid
    expect(invitation.errors[:email]).to be_present
  end

  it "rejects emails for owner" do
    invitation = InviteCollaborator.run(bot, bot.owner.email, roles)
    expect(invitation).to_not be_valid
    expect(invitation.errors[:email]).to be_present
  end

  it "validates email is present" do
    invitation = InviteCollaborator.run(bot, nil, roles)
    expect(invitation).to be_nil
  end

  it "validates given roles" do
    invitation = InviteCollaborator.run(bot, email, ['invalid-role'])
    expect(invitation).to_not be_valid
    expect(invitation.errors[:roles]).to be_present
  end

  it "does not send email if any parameter is not valid" do
    InviteCollaborator.run(bot, email, ['invalid-role'])
    expect(all_mail_deliveries).to be_empty
  end

  describe "creator" do
    let!(:creator) { user }

    it "validates that is (at least) a collaborator" do
      invitation = InviteCollaborator.run(bot, email, roles, create(:user))
      expect(invitation).to_not be_valid
      expect(invitation.errors[:creator]).to be_present
    end

    it "is set on the invitation" do
      invitation = InviteCollaborator.run(bot, email, roles, creator)
      expect(invitation).to be_valid
      expect(invitation.creator).to eq(creator)
    end

    it "is the bot owner by default" do
      invitation = InviteCollaborator.run(bot, email, roles)
      expect(invitation).to be_valid
      expect(invitation.creator).to eq(bot.owner)
    end

    it "cannot be nil" do
      invitation = InviteCollaborator.run(bot, email, roles, nil)
      expect(invitation).to_not be_valid
      expect(invitation.errors[:creator]).to be_present
    end
  end
end
