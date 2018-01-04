require 'rails_helper'

describe ChannelPolicy do
  subject { described_class.new(user, channel) }
  let(:user) { User.create! email: 'user@example.com' }

  describe "of owned bot" do
    let(:channel) { Bot.create_prepared!(user).channels.first }

    it { is_expected.to permit_actions([:update]) }
  end

  describe "of other bots" do
    let(:other_user) { User.create! email: 'other@example.com' }
    let(:channel) { Bot.create_prepared!(other_user).channels.first }

    it { is_expected.to forbid_actions([:update]) }
  end

  describe "of shared bots" do
    let(:channel) { create(:bot, shared_with: user).channels.first }

    it { is_expected.to permit_actions([:update]) }
  end
end
