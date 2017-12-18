require 'rails_helper'

describe BehaviourPolicy do
  subject { described_class.new(user, behaviour) }
  let(:user) { User.create! email: 'user@example.com' }

  describe "front desk" do
    let(:behaviour) { Bot.create_prepared!(user).front_desk }

    it { is_expected.to permit_actions([:update]) }
    it { is_expected.to forbid_actions([:destroy]) }
  end

  describe "other behaviours" do
    let(:behaviour) { bot.skills.create_skill! 'keyword_responder' }

    describe "of owned bot" do
      let(:bot) { create(:bot, owner: user) }

      it { is_expected.to permit_actions([:update, :destroy]) }
    end

    describe "of shared bots" do
      let(:bot) {
        create(:bot) do |bot|
          bot.collaborators.create! role: 'collaborator', user: user
        end
      }

      it { is_expected.to permit_actions([:update, :destroy]) }
    end
  end

  describe "of other bots" do
    let(:bot) { create(:bot) }
    let(:behaviour) { bot.skills.create_skill! 'keyword_responder' }

    it { is_expected.to forbid_actions([:update, :destroy]) }
  end
end
