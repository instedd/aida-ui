require 'rails_helper'

describe BotPolicy do
  describe "for the class" do
    subject { described_class.new(user, Bot) }
    let(:user) { User.create! email: 'user@example.com' }

    it { is_expected.to permit_actions([:index, :create]) }
  end

  describe "for a specific bot" do
    subject { described_class.new(user, bot) }
    let(:user) { User.create! email: 'user@example.com' }

    describe "being the owner" do
      let(:bot) { Bot.create_prepared!(user) }

      it { is_expected.to permit_actions([:update, :destroy,
                                          :publish, :unpublish,
                                          :read_session_data, :read_usage_stats,
                                          :read_channels,
                                          :read_behaviours, :create_skill,
                                          :read_translations, :update_translation]) }
    end

    describe "not being the owner" do
      let(:bot) { Bot.create_prepared!(User.create! email: 'other@example.com')}

      it { is_expected.to forbid_actions([:update, :destroy,
                                          :publish, :unpublish,
                                          :read_session_data, :read_usage_stats,
                                          :read_channels,
                                          :read_behaviours, :create_skill,
                                          :read_translations, :update_translation]) }
    end
  end
end
