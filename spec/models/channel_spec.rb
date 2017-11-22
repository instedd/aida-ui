require 'rails_helper'

RSpec.describe Channel, type: :model do
  describe "validates config schema" do
    let(:bot) { Bot.new }

    it "accepts valid facebook config" do
      channel = Channel.new bot: bot, kind: "facebook", name: "facebook", config: {
        "page_id" => "", "verify_token" => "", "access_token" => ""
      }
      expect(channel).to be_valid
    end

    it "rejects invalid facebook config" do
      channel = Channel.new bot: bot, kind: "facebook", name: "facebook", config: {}
      expect(channel).to_not be_valid
    end
  end
end
