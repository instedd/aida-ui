require 'rails_helper'

RSpec.describe Bot, type: :model do
  let(:user) { User.create!(email: "user@example.com") }

  it "can create bot" do
    bot = Bot.create_prepared!(user)
    expect(bot).to_not be_nil
    expect(bot).to be_valid
  end

  describe "manifest" do
    let!(:bot) { Bot.create_prepared! user }
    let!(:skill) { bot.skills.create_skill! 'keyword_responder' }

    it "generates manifest" do
      manifest = bot.manifest
      expect(manifest).to_not be_nil
      expect(manifest[:version]).to eq("1")
      expect(manifest.keys).to match_array(%i(version languages front_desk skills variables channels data_tables public_keys))
    end

    it "outputs only enabled skills" do
      expect(bot.manifest[:skills].size).to eq(1)
      skill.update_attributes! enabled: false
      bot.reload
      expect(bot.manifest[:skills].size).to eq(0)
    end

    describe "with multiple languages" do
      let!(:language_detector) {
        bot.skills.create_skill! 'language_detector',
                                 config: {
                                   languages: [
                                     {code: 'en', keywords: 'en'},
                                     {code: 'es', keywords: 'es'}
                                   ]
                                 }
      }

      it "outputs available languages" do
        expect(bot.manifest[:languages]).to match_array(['en', 'es'])
      end

      it "outputs localized messages with their translations" do
        bot.front_desk.update_attributes! config: {
                                            "greeting" => "Hi!",
                                            "introduction" => "I'm a bot",
                                            "not_understood" => "I don't understand",
                                            "clarification" => "Please repeat",
                                            "threshold" => 0.5
                                          }
        bot.front_desk.translations.create! key: 'greeting', lang: 'es', value: 'Hola'

        manifest = bot.manifest.with_indifferent_access
        expect(manifest[:front_desk][:greeting]).to match({ message: { en: 'Hi!', es: 'Hola' }})
      end
    end
  end

  describe "available_languages" do
    let!(:bot) { Bot.create_prepared! user }

    it "returns a single language if the bot has no language detector" do
      expect(bot.language_detector).to be_nil
      expect(bot.available_languages).to eq(['en'])
    end

    it "returns the list of configured languages in the language detector" do
      bot.skills.create_skill! 'language_detector',
                               config: {
                                 languages: [
                                   {code: 'en', keywords: 'en'},
                                   {code: 'es', keywords: 'es'}
                                 ]
                               }
      expect(bot.language_detector).to_not be_nil
      expect(bot.available_languages).to eq(['en', 'es'])
    end
  end

  describe "translation_keys" do
    let!(:bot) { Bot.create_prepared! user }

    it "returns front_desk translations for a bot with no skills" do
      keys = bot.translation_keys

      expect(keys).to be_an(Array)
      expect(keys.size).to eq(1)
      expect(keys.first[:id]).to eq(bot.front_desk.id)
      expect(keys.first[:keys]).to match(bot.front_desk.translation_keys)
    end

    it "returns all skills translation keys" do
      # language detector has no translatable keys
      bot.skills.create_skill! 'language_detector', order: 1
      skill_2 = bot.skills.create_skill! 'keyword_responder', order: 2
      keys = bot.translation_keys

      expect(keys).to be_an(Array)
      expect(keys.size).to eq(2)
      expect(keys[0][:id]).to eq(bot.front_desk.id)
      expect(keys[1][:id]).to eq(skill_2.id)
    end
  end
end
