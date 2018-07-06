require 'rails_helper'

RSpec.describe DuplicateBot, type: :service do
  let(:bot) {
    create(:bot, shared_with: create(:user)).tap do |bot|
      bot.front_desk.update_attributes! config: {
                                          "greeting" => "Hi",
                                          "introduction" => "I'm a bot",
                                          "not_understood" => "Wat?",
                                          "clarification" => "Say again",
                                          "threshold" => 0.4,
                                          "unsubscribe_introduction_message" => "send UNS to unsubscribe",
                                          "unsubscribe_keywords" => "UNS",
                                          "unsubscribe_acknowledge_message" => "Successfully unsubscribed"
                                      }
      bot.skills.create_skill! 'language_detector', config: {
                                 "explanation" => "Language?",
                                 "languages" => [
                                   { "code" => "en", "keywords" => "english" },
                                   { "code" => "es", "keywords" => "spanish" }
                                 ]
                               }
      responder = bot.skills.create_skill! 'keyword_responder', config: {
                                             "explanation" => "I say 'foo'",
                                             "clarification" => "Tell me 'foo'",
                                             "keywords" => "foo",
                                             "response" => "foo, what did you expect?"
                                           }
      bot.front_desk.translations.create! lang: 'es', key: 'greeting', value: 'Hola'
      bot.front_desk.translations.create! lang: 'es', key: 'not_understood', value: 'Que?'
      responder.translations.create! lang: 'es', key: 'explanation', value: "Digo 'foo'"
      responder.translations.create! lang: 'es', key: 'response', value: "foo, que esperabas?"
      bot.variable_assignments.create! variable_id: 'var-1', variable_name: 'foo', value: 'bar', condition_order: 0
      bot.variable_assignments.create! variable_id: 'var-1', variable_name: 'foo', value: 'bar-es', lang: 'es', condition_order: 0
      bot.variable_assignments.create! variable_id: 'var-1', variable_name: 'foo', condition_id: 'cond-1', condition: '${quux} = 1', condition_order: 1, value: 'bar-1'
      bot.variable_assignments.create! variable_id: 'var-1', variable_name: 'foo', condition_id: 'cond-1', condition: '${quux} = 1', condition_order: 1, value: 'bar-1-es', lang: 'es'
    end
  }
  let(:user) { create(:user) }

  let(:duplicate) { DuplicateBot.run(bot, user) }

  it "creates a new bot" do
    expect(duplicate).to be_a(Bot)
    expect(duplicate.id).not_to eq(bot.id)
    expect(duplicate).to be_persisted
  end

  it "sets the correct owner" do
    expect(duplicate.owner).to eq(user)
  end

  it "does not copy the uuid" do
    expect(duplicate).not_to be_published
    expect(duplicate.uuid).to be_nil
  end

  it "does not duplicate channel information" do
    expect(duplicate.channels.count).to eq(2)
    expect(duplicate.channels.first).not_to eq(bot.channels.first)
  end

  it "does not duplicate collaborators" do
    expect(duplicate.collaborators).to be_empty
  end

  it "duplicates all behaviours" do
    expect(duplicate.behaviours.count).to eq(bot.behaviours.count)
    bot.behaviours.each do |behaviour|
      dup = duplicate.behaviours.find_by(kind: behaviour.kind, name: behaviour.name, order: behaviour.order)
      expect(dup).not_to be_nil
      expect(dup.config).to eq(behaviour.config)
      expect(dup.id).not_to eq(behaviour.id)
    end
  end

  it "duplicates all translations" do
    expect(duplicate.translations.count).to eq(bot.translations.count)
    expect(duplicate.translations.pluck(:lang, :key).sort).to eq(bot.translations.pluck(:lang, :key).sort)
  end

  it "duplicates all variables" do
    expect(duplicate.variable_assignments.count).to eq(bot.variable_assignments.count)
  end

  describe "naming" do
    it "adds a 'copy' suffix" do
      expect(duplicate.name).to eq("#{bot.name} copy")
    end

    it "adds a number if the 'copy' is already a suffix" do
      bot.update_attributes! name: 'Bot copy'

      expect(duplicate.name).to eq("Bot copy 2")
    end

    it "increments the number if the 'copy' is already a suffix" do
      bot.update_attributes! name: 'Bot copy 2'

      expect(duplicate.name).to eq("Bot copy 3")
    end

    it "considers all accessible bots by the user when deciding the suffix" do
      create(:bot, name: "#{bot.name} copy", shared_with: user)

      expect(duplicate.name).to eq("#{bot.name} copy 2")
    end

    it "uses the greatest accessible copy suffix to increment" do
      create(:bot, name: "#{bot.name} copy 7", shared_with: user)
      create(:bot, name: "#{bot.name} copy 10", shared_with: user)

      expect(duplicate.name).to eq("#{bot.name} copy 11")
    end

    it "ignores inaccessible bots" do
      create(:bot, name: "#{bot.name} copy")

      expect(duplicate.name).to eq("#{bot.name} copy")
    end
  end
end
