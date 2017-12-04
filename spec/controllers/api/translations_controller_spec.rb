# coding: utf-8
require 'rails_helper'

RSpec.describe Api::TranslationsController, type: :controller do
  let!(:user) { User.create! email: "user@example.com" }
  let!(:bot) { Bot.create_prepared!(user) }
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
  before(:each) { sign_in user }

  describe "index" do
    it "fetches all translations for the bot" do
      get :index, params: { bot_id: bot.id }
      expect(response).to be_success
      expect(json_body).to be_a(Hash)
      expect(json_body['default_language']).to eq('en')
      expect(json_body['languages']).to eq(['en', 'es', 'de'])
      expect(json_body['behaviours']).to be_an(Array)
      expect(json_body['behaviours'].size).to eq(3)
      json_body['behaviours'].each do |behaviour|
        expect(behaviour).to be_a(Hash)
        expect(behaviour.keys).to match_array(%w(id label keys))
        expect(behaviour["keys"]).to be_an(Array)
        behaviour["keys"].each do |key|
          expect(key).to be_a(Hash)
          expect(key.keys).to match_array(%w(_key _label en es de))
        end
      end
    end
  end

  describe "update" do
    it "updates a single translation" do
      put :update, params: { bot_id: bot.id,
                             behaviour_id: bot.front_desk.id,
                             key: 'greeting',
                             lang: 'es',
                             value: 'Hola, soy un bot' }

      expect(response).to be_success

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
  end
end
