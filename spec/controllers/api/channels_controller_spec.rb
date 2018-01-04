require 'rails_helper'

RSpec.describe Api::ChannelsController, type: :controller do
  let!(:user) { create(:user) }
  before(:each) { sign_in user }

  let!(:bot) { create(:bot, owner: user) }
  let!(:channel) { bot.channels.first }
  let!(:shared_bot) { create(:bot, shared_with: user) }

  describe "index" do
    it "list bot channel" do
      get :index, params: { bot_id: bot.id }

      expect(json_body).to all(be_a_channel_as_json)
      expect(json_body).to match_array([{
        id: channel.id,
        name: channel.name,
        kind: channel.kind,
        config: channel.config
      }])
    end

    it "is allowed for shared bots" do
      get :index, params: { bot_id: shared_bot.id }

      expect(response).to be_success
      expect(json_body).to all(be_a_channel_as_json)
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

      expect(response).to be_success
      expect(json_body).to be_a_channel_as_json

      channel.reload
      expect(channel.name).to eq("New Name")
      expect(channel.config).to eq({
        "page_id" => "2", "verify_token" => "3", "access_token" => "4"
      })
    end

    it "is allowed for a channel from a shared bot" do
      shared_channel = shared_bot.channels.first
      put :update, params: { id: shared_channel.id,
                             channel: {
                               name: "shared channel",
                               config: {
                                 "page_id" => "foo", "verify_token" => "bar", "access_token" => "baz"
                               }
                             }
                           }
      expect(response).to be_success

      shared_channel.reload
      expect(shared_channel.name).to eq("shared channel")
    end
  end
end
