require 'rails_helper'

describe DataTablePolicy do
  subject { described_class.new(user, data_table) }
  let(:user) { create(:user) }
  let(:data_table) { create(:data_table, bot: bot) }

  describe "of owned bot" do
    let(:bot) { create(:bot, owner: user) }

    it { is_expected.to permit_actions([:show, :update, :destroy]) }
  end

  describe "of shared bots with variables role" do
    let(:bot) { create(:bot, shared_with: user, grants: %w(variables)) }

    it { is_expected.to permit_actions([:show, :update, :destroy]) }
  end

  describe "of shared bots without variables role" do
    let(:bot) { create(:bot, shared_with: user, grants: %w(results)) }

    it { is_expected.to forbid_actions([:show, :update, :destroy]) }
  end

  describe "of other bots" do
    let(:bot) { create(:bot) }

    it { is_expected.to forbid_actions([:show, :update, :destroy]) }
  end
end
