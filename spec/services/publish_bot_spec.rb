require 'rails_helper'

RSpec.describe PublishBot, type: :service do

  it "creates preview bot" do
    bot = create(:bot, preview_uuid: nil)
    expect(Backend).to receive(:create_bot) { 'bot preview uuid abc' }
    preview_uuid = PublishBot.preview(bot, 'an access token')
    expect(preview_uuid).to eq('bot preview uuid abc')
    bot.reload
    expect(bot.preview_uuid).to eq('bot preview uuid abc')
  end

  it "gets an existing preview bot" do
    bot = create(:bot, preview_uuid: 'bot preview uuid bcd')
    expect(Backend).to receive(:update_bot)
    expect {
      preview_uuid = PublishBot.preview(bot, 'an access token')
      bot.reload
      expect(preview_uuid).to eq('bot preview uuid bcd')
    }.not_to change(bot, :preview_uuid)
  end

  it "generates web channel url_key" do
    bot = create(:bot)
    bot_uuid = SecureRandom.uuid
    access_token = SecureRandom.uuid
    shortened = Shortener::ShortenedUrl.new
    shortened.unique_key = '123456789012'

    bot.channels.create! kind: "websocket", name: "Web", config: {
      "access_token" => access_token,
      "url_key" => ""
    }

    expect(Backend).to receive(:create_bot) { bot_uuid }
    expect(Shortener::ShortenedUrl).to receive(:generate).with("/c/#{bot_uuid}/#{access_token}") { shortened }
    PublishBot.run(bot)
    expect(bot.channels.last.config['url_key'].length).to eq(12)
  end

end
