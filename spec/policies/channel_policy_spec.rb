require 'rails_helper'

describe ChannelPolicy do
  subject { described_class.new(user, channel) }
  let(:user) { create(:user) }
  let(:channel) { bot.channels.first }

  describe "of owned bot" do
    let(:bot) { create(:bot, owner: user) }

    it { is_expected.to permit_actions([:update]) }
  end

  describe "of other bots" do
    let(:other_user) { create(:user) }
    let(:bot) { create(:bot, owner: other_user) }

    it { is_expected.to forbid_actions([:update]) }
  end

  describe "of shared bots with publish role" do
    let(:bot) { create(:bot, shared_with: user, grants: %w(publish)) }

    it { is_expected.to permit_actions([:update]) }
  end

  describe "of shared bots without publish role" do
    let(:bot) { create(:bot, shared_with: user, grants: %w()) }

    it { is_expected.to forbid_actions([:update]) }
  end
end
