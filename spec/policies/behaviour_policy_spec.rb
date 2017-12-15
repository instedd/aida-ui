require 'rails_helper'

describe BehaviourPolicy do
  subject { described_class.new(user, behaviour) }
  let(:user) { User.create! email: 'user@example.com' }

  describe "of owned bot" do
    let(:behaviour) { Bot.create_prepared!(user).front_desk }

    it { is_expected.to permit_actions([:update, :destroy]) }
  end

  describe "of other bots" do
    let(:other_user) { User.create! email: 'other@example.com' }
    let(:behaviour) { Bot.create_prepared!(other_user).front_desk }

    it { is_expected.to forbid_actions([:update, :destroy]) }
  end
end
