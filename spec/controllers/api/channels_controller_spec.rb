require 'rails_helper'

RSpec.describe Api::ChannelsController, type: :controller do
  let!(:user) { User.create! email: "user@example.com" }
  before(:each) { sign_in user }

  let!(:bot) { Bot.create_prepared!(user) }
  let!(:channel) { bot.channels.first }

  describe "index" do
    it "list bot channel" do
      get :index, params: { bot_id: bot.id }

      expect(json_body).to match_array([{
        id: channel.id,
        name: channel.name,
        kind: channel.kind,
        config: channel.config
      }])
    end
  end

  describe "update" do
    it "update bot config" do
      put :update, params: { id: channel.id,
        channel: {
          name: "New Name",
          config: {
            "page_id" => "2", "verify_token" => "3", "access_token" => "4"
          }
        }
      }

      channel.reload
      expect(channel.name).to eq("New Name")
      expect(channel.config).to eq({
        "page_id" => "2", "verify_token" => "3", "access_token" => "4"
      })
    end
  end
end
