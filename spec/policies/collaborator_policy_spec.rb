require 'rails_helper'

describe CollaboratorPolicy do
  subject { described_class.new(user, collaborator) }
  let(:user) { create(:user) }
  let(:other_user) { create(:user) }
  let(:collaborator) { bot.collaborators.add_collaborator!(other_user, roles: %w(results)) }

  describe "of owned bot" do
    let(:bot) { create(:bot, owner: user) }

    it { is_expected.to permit_actions([:update, :destroy]) }
  end

  describe "of other bots" do
    let(:bot) { create(:bot) }

    it { is_expected.to forbid_actions([:update, :destroy]) }
  end

  describe "of shared bots" do
    let(:bot) { create(:bot, shared_with: user) }

    it { is_expected.to forbid_actions([:destroy, :update]) }
  end

  describe "for own collaboration" do
    let(:bot) { create(:bot) }
    let(:collaborator) { bot.collaborators.add_collaborator!(user) }

    it { is_expected.to permit_actions([:destroy]) }
    it { is_expected.to forbid_actions([:update]) }
  end
end
