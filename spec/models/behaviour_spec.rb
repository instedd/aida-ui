# coding: utf-8
require 'rails_helper'

RSpec.describe Behaviour, type: :model do
  let!(:bot) { Bot.create_prepared!(User.create email: 'foo@example.com')}

  def add_languages(*languages)
    bot.skills.create_skill! 'language_detector', config: {
                               languages: languages.map do |lang|
                                 { code: lang, keywords: lang }
                               end
                             }
  end

  describe "front_desk" do
    let!(:front_desk) { bot.front_desk }

    it "creates valid behaviour" do
      front_desk = bot.behaviours.create_front_desk!
      expect(front_desk).to be_valid
    end

    it "generates manifest fragment" do
      fragment = front_desk.manifest_fragment
      expect(fragment).to_not be_nil
      expect(fragment.keys).to match_array(%i(greeting introduction clarification not_understood threshold unsubscribe))
    end

    it "returns translation keys" do
      keys = front_desk.translation_keys
      expect(keys).to be_an(Array)
      expect(keys.size).to eq(7)
      expect(keys.first.keys).to match_array(%i(key label default_translation))
    end

    it "manifest returns translated messages" do
      add_languages 'en', 'es', 'it'
      front_desk.config["greeting"] = 'Hi'
      front_desk.translations.create! key: 'greeting', lang: 'es', value: 'Hola'
      front_desk.translations.create! key: 'greeting', lang: 'it', value: 'Ciao'
      fragment = front_desk.manifest_fragment.with_indifferent_access
      expect(fragment[:greeting]).to match({ message: { en: 'Hi', es: 'Hola', it: 'Ciao' }})
    end

    it "uses default language for missing translations" do
      add_languages 'en', 'es', 'it'
      front_desk.config["greeting"] = 'Hi'
      fragment = front_desk.manifest_fragment.with_indifferent_access
      expect(fragment[:greeting]).to match({ message: { en: 'Hi', es: 'Hi', it: 'Hi' }})
    end

    it "manifest returns unsubscribe settings" do
      front_desk.config["unsubscribe_introduction_message"] = "intro_mess"
      front_desk.config["unsubscribe_keywords"] = "keyw1, key2"
      front_desk.config["unsubscribe_acknowledge_message"] = "ack_mess"

      fragment = front_desk.manifest_fragment.with_indifferent_access

      expect(fragment[:unsubscribe]).to match({
        introduction_message: {message: { en: 'intro_mess' }},
        keywords: { en: ['keyw1', 'key2'] },
        acknowledge_message: { message: { en: 'ack_mess' }}
      })
    end

    it "manifest returns unsubscribe settings with defaults" do
      fragment = front_desk.manifest_fragment.with_indifferent_access
        expect(fragment[:unsubscribe]).to match({
        introduction_message: {message: { en: 'Send UNSUBSCRIBE to stop receiving messages' }},
        keywords: { en: ['UNSUBSCRIBE'] },
        acknowledge_message: { message: { en: "I won't send you any further messages" }}
      })
    end

  end

  describe "keyword_responder" do
    let!(:responder) { bot.skills.create_skill!('keyword_responder') }

    it "creates valid and enabled skill" do
      expect(responder).to be_valid
      expect(responder).to be_enabled
    end

    it "generates manifest fragment" do
      fragment = responder.manifest_fragment
      expect(fragment).to_not be_nil
      expect(fragment.keys).to match_array(%i(type id name explanation keywords response clarification))
    end

    it "returns translation keys" do
      keys = responder.translation_keys
      expect(keys).to be_an(Array)
      expect(keys.size).to eq(4)
      expect(keys.first.keys).to match_array(%i(key label default_translation))
    end

    it "manifest returns translated messages" do
      add_languages 'en', 'es'
      responder.config["keywords"] = "foo, bar"
      responder.translations.create! key: 'keywords', lang: 'es', value: 'baz, quux'
      fragment = responder.manifest_fragment.with_indifferent_access
      expect(fragment[:keywords]).to match({ en: ['foo', 'bar'], es: ['baz', 'quux'] })
    end
  end

  describe "language_detector" do
    let!(:detector) { bot.skills.create_skill!('language_detector') }

    it "creates valid skill" do
      expect(detector).to be_valid
      expect(detector).to be_enabled
    end

    it "generates manifest fragment" do
      fragment = detector.manifest_fragment
      expect(fragment).to_not be_nil
      expect(fragment.keys).to match_array(%i(type explanation reply_to_unsupported_language languages))
    end

    it "has no translation keys" do
      keys = detector.translation_keys
      expect(keys).to be_an(Array)
      expect(keys).to be_empty
    end
  end

  describe "survey" do
    let!(:survey) {
      bot.skills.create_skill!('survey', config: {
                                 schedule: '2017-12-15T14:30:00Z',
                                 keywords: 'age',
                                 questions: [
                                   { type: 'select_one',
                                     name: 'opt_in',
                                     choices: 'yes_no',
                                     message: 'Can I ask you a question?' },
                                   { type: 'integer',
                                     name: 'age',
                                     message: 'How old are you?',
                                     constraint: '. <= 150',
                                     constraint_message: 'No way you are that old' }
                                 ],
                                 choice_lists: [
                                   { name: 'yes_no',
                                     choices: [
                                       { name: 'yes', labels: 'yes,yep,sure,ok' },
                                       { name: 'no', labels: 'no,nope,later' }
                                     ]}
                                 ]
                               })
    }

    it "creates valid skill" do
      expect(survey).to be_valid
      expect(survey).to be_enabled
    end

    it "generates manifest fragment" do
      fragment = survey.manifest_fragment
      expect(fragment).to_not be_nil
      expect(fragment.keys).to match_array(%i(type id schedule keywords name questions choice_lists))
      expect(fragment[:questions].size).to eq(2)
      expect(fragment[:questions][0]).to match({ type: 'select_one',
                                                 name: 'opt_in',
                                                 choices: 'yes_no',
                                                 message: {
                                                   'en' => 'Can I ask you a question?'
                                                 }})
      expect(fragment[:questions][1]).to match({ type: 'integer',
                                                 name: 'age',
                                                 message: {
                                                   'en' => 'How old are you?'
                                                 },
                                                 constraint: '. <= 150',
                                                 constraint_message: {
                                                   'en' => 'No way you are that old'
                                                 }})
      expect(fragment[:choice_lists].size).to eq(1)
      expect(fragment[:choice_lists][0]).to match({ name: 'yes_no',
                                                    choices: [
                                                      { name: 'yes',
                                                        labels: {
                                                          'en' => ['yes', 'yep', 'sure', 'ok']
                                                        }
                                                      },
                                                      { name: 'no',
                                                        labels: {
                                                          'en' => ['no', 'nope', 'later']
                                                        }
                                                      }
                                                    ]
                                                  })
    end

    it "does not include keywords when not defined" do
      survey.config["keywords"] = ""
      expect(survey.manifest_fragment.keys).to_not include(:keywords)
    end

    it "generates manifest with translations" do
      add_languages 'en', 'es'
      survey.translations.create! key: 'keywords', lang: 'es', value: 'edad'
      survey.translations.create! key: 'questions/[name=opt_in]/message', lang: 'es', value: 'Puedo preguntarte algo?'
      survey.translations.create! key: 'questions/[name=age]/message', lang: 'es', value: 'Qué edad tenés?'
      survey.translations.create! key: 'questions/[name=age]/constraint_message', lang: 'es', value: 'No podés tener esa edad'
      survey.translations.create! key: 'choice_lists/[name=yes_no]/choices/[name=yes]/labels', lang: 'es', value: 'si,sep,claro'
      survey.translations.create! key: 'choice_lists/[name=yes_no]/choices/[name=no]/labels', lang: 'es', value: 'no,luego'

      fragment = survey.manifest_fragment
      expect(fragment[:keywords]).to match({ 'en' => ['age'], 'es' => ['edad'] })
      expect(fragment[:questions][0][:message]).to match({ 'en' => 'Can I ask you a question?',
                                                           'es' => 'Puedo preguntarte algo?' })
      expect(fragment[:questions][1][:message]).to match({ 'en' => 'How old are you?',
                                                           'es' => 'Qué edad tenés?' })
      expect(fragment[:questions][1][:constraint_message]).to match({ 'en' => 'No way you are that old',
                                                                      'es' => 'No podés tener esa edad' })
      expect(fragment[:choice_lists][0][:choices][0][:labels]).to match({ 'en' => ['yes', 'yep', 'sure', 'ok'],
                                                                          'es' => ['si', 'sep', 'claro'] })
      expect(fragment[:choice_lists][0][:choices][1][:labels]).to match({ 'en' => ['no', 'nope', 'later'],
                                                                          'es' => ['no', 'luego'] })
    end

    it "returns translation keys for questions and choice lists" do
      keys = survey.translation_keys
      expect(keys).to be_an(Array)
      expect(keys.map { |key| key[:key] }).to match_array(['keywords',
                                                           'questions/[name=opt_in]/message',
                                                           'questions/[name=age]/message',
                                                           'questions/[name=age]/constraint_message',
                                                           'choice_lists/[name=yes_no]/choices/[name=yes]/labels',
                                                           'choice_lists/[name=yes_no]/choices/[name=no]/labels'])
      expect(keys.map { |key| key[:default_translation] }).to match_array(['age',
                                                                           'Can I ask you a question?',
                                                                           'How old are you?',
                                                                           'No way you are that old',
                                                                           'yes,yep,sure,ok',
                                                                           'no,nope,later'])
    end
  end

  describe "scheduled_messages" do
    it "creates valid skill" do
      scheduled_messages = bot.skills.create_skill!('scheduled_messages')
      expect(scheduled_messages).to be_valid
      expect(scheduled_messages).to be_enabled
    end

    it "generates manifest fragment" do
      scheduled_messages = bot.skills.create_skill!('scheduled_messages')
      fragment = scheduled_messages.manifest_fragment
      expect(fragment).to_not be_nil
      expect(fragment.keys).to match_array(%i(type id name schedule_type messages))
    end
  end
end
