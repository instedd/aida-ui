require 'rails_helper'

describe BehaviourPolicy do
  subject { described_class.new(user, behaviour) }
  let(:user) { create(:user) }

  describe "front desk" do
    let(:behaviour) { bot.front_desk }

    describe "of owned bot" do
      let(:bot) { create(:bot, owner: user) }

      it { is_expected.to permit_actions([:update]) }
      it { is_expected.to forbid_actions([:destroy]) }
    end

    describe "of shared bots with behaviour role" do
      let(:bot) { create(:bot, shared_with: user, grants: %w(behaviour)) }

      it { is_expected.to permit_actions([:update]) }
      it { is_expected.to forbid_actions([:destroy]) }
    end

    describe "of shared bots without behaviour role" do
      let(:bot) { create(:bot, shared_with: user, grants: %w(results)) }

      it { is_expected.to forbid_actions([:update, :destroy]) }
    end
  end

  describe "other behaviours" do
    let(:behaviour) { bot.skills.create_skill! 'keyword_responder' }

    describe "of owned bot" do
      let(:bot) { create(:bot, owner: user) }

      it { is_expected.to permit_actions([:update, :destroy]) }
    end

    describe "of shared bots with behaviour role" do
      let(:bot) { create(:bot, shared_with: user, grants: %w(behaviour)) }

      it { is_expected.to permit_actions([:update, :destroy]) }
    end

    describe "of shared bots without behaviour role" do
      let(:bot) { create(:bot, shared_with: user, grants: %w(results)) }

      it { is_expected.to forbid_actions([:update, :destroy]) }
    end
  end

  describe "of other bots" do
    let(:bot) { create(:bot) }
    let(:behaviour) { bot.skills.create_skill! 'keyword_responder' }

    it { is_expected.to forbid_actions([:update, :destroy]) }
  end
end
