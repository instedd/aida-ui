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

    it "destroys shortened_url before_destroy" do
      shortened_url = Shortener::ShortenedUrl.generate("relative_url").unique_key
      channel = Channel.new bot: bot, kind: "websocket", name: "Web", config: {
        "access_token" => "an access token",
        "url_key" => shortened_url
      }
      url_key = channel.config['url_key']
      expect(url_key).to eq(shortened_url)
      expect(Shortener::ShortenedUrl.exists?(:unique_key => url_key)).to be true
      channel.destroy!()
      expect(Shortener::ShortenedUrl.exists?(:unique_key => url_key)).to be false
    end
  end
end
