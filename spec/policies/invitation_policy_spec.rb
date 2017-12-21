require 'rails_helper'

describe InvitationPolicy do
  subject { described_class.new(user, invitation) }
  let(:user) { create(:user) }

  describe "admin" do
    let(:invitation) { create(:invitation, bot: bot) }

    describe "of owned bot" do
      let(:bot) { create(:bot, owner: user) }

      it { is_expected.to permit_actions([:resend, :destroy]) }
    end

    describe "of other bots" do
      let(:bot) { create(:bot) }

      it { is_expected.to forbid_actions([:resend, :destroy]) }
    end

    describe "of shared bots" do
      let(:bot) { create(:bot, shared_with: user) }

      it { is_expected.to permit_actions([:resend, :destroy]) }
    end
  end

  describe "anonymous invitations" do
    let(:invitation) { create(:invitation, :anonymous, bot: bot) }

    describe "of owned bots" do
      let(:bot) { create(:bot, owner: user) }

      it { is_expected.to forbid_actions([:retrieve, :accept]) }
    end

    describe "of other bots" do
      let(:bot) { create(:bot) }

      it { is_expected.to permit_actions([:retrieve, :accept]) }
    end

    describe "of shared bots" do
      let(:bot) { create(:bot, shared_with: user) }

      it { is_expected.to forbid_actions([:retrieve, :accept]) }
    end
  end

  describe "recipient invitations" do
    let(:invitation) { create(:invitation, bot: bot, email: user.email) }

    describe "of other bots" do
      let(:bot) { create(:bot) }

      it { is_expected.to permit_actions([:retrieve, :accept]) }
    end

    # invitations to owner and collaborators are not valid
  end

  describe "other invitations" do
    let(:invitation) { create(:invitation, bot: bot) }

    describe "of owned bots" do
      let(:bot) { create(:bot, owner: user) }

      it { is_expected.to forbid_actions([:retrieve, :accept]) }
    end

    describe "of other bots" do
      let(:bot) { create(:bot) }

      it { is_expected.to forbid_actions([:retrieve, :accept]) }
    end

    describe "of shared bots" do
      let(:bot) { create(:bot, shared_with: user) }

      it { is_expected.to forbid_actions([:retrieve, :accept]) }
    end
  end
end
