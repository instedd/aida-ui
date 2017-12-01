require 'rails_helper'

RSpec.describe Bot, type: :model do
  let(:user) { User.create!(email: "user@example.com") }

  it "can create bot" do
    Bot.create_prepared! user
  end

  describe "manifest" do
    let!(:bot) { Bot.create_prepared! user }
    let!(:skill) { bot.skills.create_skill! 'keyword_responder' }

    it "generates manifest" do
      manifest = bot.manifest
      expect(manifest).to_not be_nil
      expect(manifest[:version]).to eq(1)
      expect(manifest.keys).to match_array(%i(version languages front_desk skills variables channels))
    end

    it "outputs only enabled skills" do
      expect(bot.manifest[:skills].size).to eq(1)
      skill.update_attributes! enabled: false
      bot.reload
      expect(bot.manifest[:skills].size).to eq(0)
    end
  end
end
