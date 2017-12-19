# coding: utf-8
require 'rails_helper'

RSpec.describe Api::TranslationsController, type: :controller do
  let!(:user) { create(:user) }
  let!(:bot) { create(:bot, owner: user) }
  let!(:language_detector) {
    bot.skills.create_skill! 'language_detector',
                             config: {
                               languages: [
                                 {code: 'en', keywords: 'english'},
                                 {code: 'es', keywords: 'español'},
                                 {code: 'de', keywords: 'deutsch'}
                               ]
                             }
  }
  let!(:other_skill) {
    bot.skills.create_skill! 'keyword_responder'
  }
  let!(:shared_bot) {
    create(:bot, shared_with: user) do |bot|
      bot.skills.create_skill! 'language_detector',
                               config: {
                                 languages: [
                                   {code: 'en', keywords: 'english'},
                                   {code: 'es', keywords: 'español'}
                                 ]
                               }
    end
  }
  let!(:other_shared_skill) {
    shared_bot.skills.create_skill! 'keyword_responder'
  }
  before(:each) { sign_in user }

  describe "index" do
    it "fetches all translations for the bot" do
      get :index, params: { bot_id: bot.id }
      expect(response).to be_success
      expect(json_body).to be_a_translations_index_as_json.matching(languages: ['en', 'es', 'de'],
                                                                    default_language: 'en')
      expect(json_body['behaviours'].size).to eq(2)
      json_body['behaviours'].each do |behaviour|
        behaviour["keys"].each do |key|
          expect(key.keys).to include('en', 'es', 'de')
        end
      end
    end

    it "is allowed on a shared bot" do
      get :index, params: { bot_id: shared_bot.id }
      expect(response).to be_success
      expect(json_body).to be_a_translations_index_as_json
    end
  end

  describe "update" do
    it "updates a single translation" do
      put :update, params: { bot_id: bot.id,
                             behaviour_id: bot.front_desk.id,
                             key: 'greeting',
                             lang: 'es',
                             value: 'Hola, soy un bot' }

      expect(response.status).to eq(204)

      translation = bot.translations.where(behaviour_id: bot.front_desk.id,
                                           key: 'greeting',
                                           lang: 'es').first
      expect(translation).to_not be_nil
      expect(translation.value).to eq('Hola, soy un bot')
    end

    it "rejects an invalid behaviour" do
      put :update, params: { bot_id: bot.id,
                             behaviour_id: -1,
                             key: 'greeting',
                             lang: 'es',
                             value: 'Hola, soy un bot' }

      expect(response.status).to eq(404)
    end

    it "rejects an invalid translation key" do
      put :update, params: { bot_id: bot.id,
                             behaviour_id: bot.front_desk.id,
                             key: 'foobar',
                             lang: 'es',
                             value: 'Hola, soy un bot' }
      expect(response.status).to eq(400)
    end

    it "rejects a language not available in the bot" do
      put :update, params: { bot_id: bot.id,
                             behaviour_id: bot.front_desk.id,
                             key: 'greeting',
                             lang: 'it',
                             value: 'Ciao!' }
      expect(response.status).to eq(400)
    end

    it "rejects a translation for the default language" do
      put :update, params: { bot_id: bot.id,
                             behaviour_id: bot.front_desk.id,
                             key: 'greeting',
                             lang: 'en',
                             value: 'Hello!' }
      expect(response.status).to eq(400)
    end

    it "is allowed on shared bots" do
      put :update, params: { bot_id: shared_bot.id,
                             behaviour_id: shared_bot.front_desk.id,
                             key: 'greeting',
                             lang: 'es',
                             value: 'Hola, soy un bot' }

      expect(response.status).to eq(204)

      translation = shared_bot.translations.where(behaviour_id: shared_bot.front_desk.id,
                                                  key: 'greeting',
                                                  lang: 'es').first
      expect(translation).to_not be_nil
      expect(translation.value).to eq('Hola, soy un bot')
    end
  end

  describe "variables" do
    def uuid
      SecureRandom.uuid
    end

    let(:default_language) { "en" }
    let(:other_language) { "es" }

    def bot_variables
      bot.reload
      VariableAssignment.api_json(bot.variable_assignments, bot.default_language, bot.other_languages)
    end

    it "index uses VariableAssignment#api_json" do
      get :index, params: { bot_id: bot.id }
      expect(response).to be_success
      expect(json_body['variables']).to match_array(bot_variables)

      expect(bot_variables).to match_array([])
    end

    it "allows creating a new variable" do
      foo_uuid = uuid

      put :update_variable, params: { bot_id: bot.id,
                                      variable_id: foo_uuid,
                                      variable_name: "foo",
                                      lang: default_language,
                                      value: "42" }

      expect(response.status).to eq(204)

      expect(bot_variables).to match_array([{
        id: foo_uuid, name: "foo",
        default_value: { en: "42", es: "", de: "" },
        conditional_values: []
      }])

      expect(bot.variable_assignments.where(variable_id: foo_uuid, lang: nil).count).to eq(1)
    end

    it "allows renaming the variable when submitting translations to default value" do
      foo_uuid = uuid

      put :update_variable, params: { bot_id: bot.id,
                                      variable_id: foo_uuid,
                                      variable_name: "foo",
                                      lang: default_language,
                                      value: "42" }

      put :update_variable, params: { bot_id: bot.id,
                                      variable_id: foo_uuid,
                                      variable_name: "foo_changed",
                                      lang: other_language,
                                      value: "43" }

      expect(response.status).to eq(204)

      expect(bot_variables).to match_array([{
        id: foo_uuid, name: "foo_changed",
        default_value: { en: "42", es: "43", de: "" },
        conditional_values: []
      }])

      expect(bot.variable_assignments.where(variable_id: foo_uuid, variable_name: "foo_changed").count).to eq(2)
    end

    it "it creates variable if need when a condition is sent" do
      foo_uuid = uuid
      condition_uuid = uuid

      put :update_variable, params: { bot_id: bot.id,
                                      variable_id: foo_uuid,
                                      variable_name: "foo",
                                      condition: "${bar} > 48",
                                      condition_id: condition_uuid,
                                      condition_order: 1,
                                      lang: other_language,
                                      value: "43" }

      expect(response.status).to eq(204)

      expect(bot_variables).to match_array([{
        id: foo_uuid, name: "foo",
        default_value: { en: "", es: "", de: "" },
        conditional_values: [
          {
            id: condition_uuid,
            condition: "${bar} > 48",
            order: 1,
            value: { en: "", es: "43", de: "" },
          }
        ]
      }])

      expect(bot.variable_assignments.where(variable_id: foo_uuid, condition_id: nil).count).to eq(1)
      expect(bot.variable_assignments.where(variable_id: foo_uuid, condition_id: condition_uuid).count).to eq(2)
    end

    it "allows renaming the variable when submitting translations to condition value" do
      foo_uuid = uuid
      condition_uuid = uuid

      put :update_variable, params: { bot_id: bot.id,
                                      variable_id: foo_uuid,
                                      variable_name: "foo",
                                      condition: "${bar} > 48",
                                      condition_id: condition_uuid,
                                      condition_order: 1,
                                      lang: default_language,
                                      value: "43" }

      put :update_variable, params: { bot_id: bot.id,
                                      variable_id: foo_uuid,
                                      variable_name: "foo_changed",
                                      condition: "${bar} > 48",
                                      condition_id: condition_uuid,
                                      condition_order: 1,
                                      lang: other_language,
                                      value: "88" }

      expect(response.status).to eq(204)

      expect(bot_variables).to match_array([{
        id: foo_uuid, name: "foo_changed",
        default_value: { en: "", es: "", de: "" },
        conditional_values: [
          {
            id: condition_uuid,
            condition: "${bar} > 48",
            order: 1,
            value: { en: "43", es: "88", de: "" },
          }
        ]
      }])

      expect(bot.variable_assignments.where(variable_id: foo_uuid, variable_name: "foo_changed").count).to eq(3)
    end

    it "allows changing the condition to all translations" do
      foo_uuid = uuid
      condition_uuid = uuid

      put :update_variable, params: { bot_id: bot.id,
                                      variable_id: foo_uuid,
                                      variable_name: "foo",
                                      condition: "${bar} > 48",
                                      condition_id: condition_uuid,
                                      condition_order: 1,
                                      lang: default_language,
                                      value: "43" }

      put :update_variable, params: { bot_id: bot.id,
                                      variable_id: foo_uuid,
                                      variable_name: "foo",
                                      condition: "${bar} > 60",
                                      condition_id: condition_uuid,
                                      condition_order: 1,
                                      lang: other_language,
                                      value: "88" }

      expect(response.status).to eq(204)

      expect(bot_variables).to match_array([{
        id: foo_uuid, name: "foo",
        default_value: { en: "", es: "", de: "" },
        conditional_values: [
          {
            id: condition_uuid,
            condition: "${bar} > 60",
            order: 1,
            value: { en: "43", es: "88", de: "" },
          }
        ]
      }])

      expect(bot.variable_assignments.where(variable_id: foo_uuid, condition_id: condition_uuid, condition: "${bar} > 60").count).to eq(2)
    end

    it "allows changing the default language of the bot" do
      foo_uuid = uuid

      put :update_variable, params: { bot_id: bot.id,
                                      variable_id: foo_uuid,
                                      variable_name: "foo",
                                      lang: default_language,
                                      value: "42" }

      bot.language_detector.update_attributes!(config: {
         explanation: "",
         languages: [
           {code: 'de', keywords: 'deutsch'},
           {code: 'es', keywords: 'español'}
         ]
      })

      expect(bot_variables).to match_array([{
        id: foo_uuid, name: "foo",
        default_value: { de: "42", es: "" },
        conditional_values: []
      }])
    end

    it "fails if invalid language is used" do
      put :update_variable, params: { bot_id: bot.id,
                                      variable_id: uuid,
                                      variable_name: "foo",
                                      lang: "ru",
                                      value: "42" }

      expect(response.status).to eq(400)
    end

    it "fails if only one of condition/condition_id/condition_order is missing in params" do
      put :update_variable, params: { bot_id: bot.id,
                                      variable_id: uuid,
                                      variable_name: "foo",
                                      lang: "en",
                                      value: "42",
                                      condition: "${bar} > 1"}
      expect(response.status).to eq(400)
      expect(bot.variable_assignments.count).to eq(0)

      put :update_variable, params: { bot_id: bot.id,
                                      variable_id: uuid,
                                      variable_name: "foo",
                                      lang: "en",
                                      value: "42",
                                      condition_id: uuid}
      expect(response.status).to eq(400)
      expect(bot.variable_assignments.count).to eq(0)

      put :update_variable, params: { bot_id: bot.id,
                                      variable_id: uuid,
                                      variable_name: "foo",
                                      lang: "en",
                                      value: "42",
                                      condition_order: 1}
      expect(response.status).to eq(400)
      expect(bot.variable_assignments.count).to eq(0)
    end

    it "deleting a variable removes all conditions" do
      foo_uuid = uuid

      put :update_variable, params: { bot_id: bot.id,
                                      variable_id: foo_uuid,
                                      variable_name: "foo",
                                      lang: default_language,
                                      value: "43" }

      put :update_variable, params: { bot_id: bot.id,
                                      variable_id: foo_uuid,
                                      variable_name: "foo",
                                      condition: "${bar} > 48",
                                      condition_id: uuid,
                                      condition_order: 1,
                                      lang: default_language,
                                      value: "55" }

      delete :destroy_variable, params: { bot_id: bot.id, variable_id: foo_uuid }

      expect(bot_variables).to match_array([])

      expect(bot.variable_assignments.where(variable_id: foo_uuid).count).to eq(0)
    end

    it "deleting a conditions removes all translations" do
      foo_uuid = uuid
      condition_uuid = uuid

      put :update_variable, params: { bot_id: bot.id,
                                      variable_id: foo_uuid,
                                      variable_name: "foo",
                                      lang: default_language,
                                      value: "43" }

      put :update_variable, params: { bot_id: bot.id,
                                      variable_id: foo_uuid,
                                      variable_name: "foo",
                                      condition: "${bar} > 48",
                                      condition_id: condition_uuid,
                                      condition_order: 1,
                                      lang: default_language,
                                      value: "55" }

      delete :destroy_variable, params: { bot_id: bot.id, variable_id: foo_uuid, condition_id: condition_uuid }

      expect(bot_variables).to match_array([{
        id: foo_uuid, name: "foo",
        default_value: { en: "43", es: "", de: "" },
        conditional_values: []
      }])

      expect(bot.variable_assignments.where(variable_id: foo_uuid).count).to eq(1)
    end
  end
end
