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

end
