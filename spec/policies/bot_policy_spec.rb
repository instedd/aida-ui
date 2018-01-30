require 'rails_helper'

describe BotPolicy do
  let(:user) { create(:user) }

  describe "for the class" do
    subject { described_class.new(user, Bot) }

    it { is_expected.to permit_actions([:index, :create]) }
  end

  describe "for a specific bot" do
    subject { described_class.new(user, bot) }

    describe "being the owner" do
      let(:bot) { create(:bot, owner: user) }

      it { is_expected.to permit_actions([:update, :destroy,
                                          :publish, :unpublish,
                                          :duplicate,
                                          :read_session_data, :read_usage_stats,
                                          :read_channels,
                                          :read_behaviours, :create_skill,
                                          :read_translations, :update_translation,
                                          :read_variables, :update_variable, :destroy_variable,
                                          :read_data_tables, :create_data_table,
                                          :read_collaborators, :invite_collaborator]) }
    end

    describe "not being the owner" do
      let(:bot) { create(:bot) }

      it { is_expected.to forbid_actions([:update, :destroy,
                                          :publish, :unpublish,
                                          :duplicate,
                                          :read_session_data, :read_usage_stats,
                                          :read_channels,
                                          :read_behaviours, :create_skill,
                                          :read_translations, :update_translation,
                                          :read_variables, :update_variable, :destroy_variable,
                                          :read_data_tables, :create_data_table,
                                          :read_collaborators, :invite_collaborator]) }
    end

    describe "shared with the user" do
      let(:bot) { create(:bot, shared_with: user, grants: grants) }

      describe "with publish role" do
        let(:grants) { %w(publish) }

        it { is_expected.to permit_actions([:publish, :unpublish,
                                            :read_session_data, :read_usage_stats,
                                            :read_channels,
                                            :read_behaviours, :create_skill,
                                            :read_translations, :update_translation,
                                            :read_variables, :update_variable, :destroy_variable,
                                            :read_data_tables, :create_data_table]) }
        it { is_expected.to forbid_actions([:update, :destroy,
                                            :duplicate,
                                            :read_collaborators, :invite_collaborator]) }
      end

      describe "with behaviour role" do
        let(:grants) { %w(behaviour) }

        it { is_expected.to permit_actions([:read_behaviours, :create_skill,
                                            :read_translations, :update_translation,
                                            :read_variables, :update_variable, :destroy_variable,
                                            :read_data_tables, :create_data_table]) }
        it { is_expected.to forbid_actions([:update, :destroy,
                                            :publish, :unpublish,
                                            :duplicate,
                                            :read_session_data, :read_usage_stats,
                                            :read_channels,
                                            :read_collaborators, :invite_collaborator]) }
      end

      describe "with content role" do
        let(:grants) { %w(content) }

        it { is_expected.to permit_actions([:read_translations, :update_translation]) }
        it { is_expected.to forbid_actions([:update, :destroy,
                                            :publish, :unpublish,
                                            :duplicate,
                                            :read_session_data, :read_usage_stats,
                                            :read_channels,
                                            :read_behaviours, :create_skill,
                                            :read_variables, :update_variable, :destroy_variable,
                                            :read_data_tables, :create_data_table,
                                            :read_collaborators, :invite_collaborator]) }
      end

      describe "with variables role" do
        let(:grants) { %w(variables) }

        it { is_expected.to permit_actions([:read_variables, :update_variable, :destroy_variable,
                                            :read_data_tables, :create_data_table]) }
        it { is_expected.to forbid_actions([:update, :destroy,
                                            :publish, :unpublish,
                                            :duplicate,
                                            :read_session_data, :read_usage_stats,
                                            :read_channels,
                                            :read_behaviours, :create_skill,
                                            :read_translations, :update_translation,
                                            :read_collaborators, :invite_collaborator]) }
      end

      describe "with results role" do
        let(:grants) { %w(results) }

        it { is_expected.to permit_actions([:read_session_data, :read_usage_stats]) }
        it { is_expected.to forbid_actions([:update, :destroy,
                                            :publish, :unpublish,
                                            :duplicate,
                                            :read_channels,
                                            :read_behaviours, :create_skill,
                                            :read_translations, :update_translation,
                                            :read_variables, :update_variable, :destroy_variable,
                                            :read_data_tables, :create_data_table,
                                            :read_collaborators, :invite_collaborator]) }
      end
    end
  end
end
