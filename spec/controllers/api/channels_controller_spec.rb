require 'rails_helper'

RSpec.describe Api::ChannelsController, type: :controller do
  let!(:user) { create(:user) }
  before(:each) { sign_in user }

  let!(:bot) { create(:bot, owner: user).add_default_channels!() }
  let!(:channel) { bot.channels.first }
  let!(:websocket_channel) { bot.channels[1] }
  let!(:shared_bot) { create(:bot, shared_with: user, grants: %w(publish)).add_default_channels!() }
  let!(:other_shared_bot) { create(:bot, shared_with: user, grants: %w(results)).add_default_channels!() }

  describe "create" do
    it "create bot facebook channel" do
      expect do
        post :create, params: {
          bot_id: bot.id,
          channel: {
            kind: 'facebook'
          }
        }
      end.to change(Channel, :count).by(1)

      expect(json_body).to be_a_channel_as_json
    end

    it "create bot websocket channel" do
      expect do
        post :create, params: {
          bot_id: bot.id,
          channel: {
            kind: 'websocket'
          }
        }
      end.to change(Channel, :count).by(1)

      expect(json_body).to be_a_channel_as_json
    end

    it "returns unprocessable entity when unknown channel kind" do
      expect do
        post :create, params: {
          bot_id: bot.id,
          channel: {
            kind: 'other'
          }
        }
      end.to change(Channel, :count).by(0)

      expect(response).to have_http_status(422)
      expect(response.body).to eq('{"error":"unknown channel kind"}')
    end

    it "returns unprocessable entity when missing channel kind" do
      expect do
        post :create, params: {
          bot_id: bot.id,
          channel: {
            other: 'other'
          }
        }
      end.to change(Channel, :count).by(0)

      expect(response).to have_http_status(422)
      expect(response.body).to eq('{"error":"missing channel kind"}')
    end

    it "returns unprocessable entity when missing channel" do
      expect do
        post :create, params: {
          bot_id: bot.id
        }
      end.to change(Channel, :count).by(0)

      expect(response).to have_http_status(422)
      expect(response.body).to eq('{"error":"missing channel"}')
    end
  end

  describe "destroy" do
    it "delete a bot channel" do
      expect do
        delete :destroy, params: { id: channel.id }
      end.to change(Channel, :count).by(-1)
    end
  end

  describe "index" do
    it "list bot channel" do
      get :index, params: { bot_id: bot.id }

      expect(json_body).to all(be_a_channel_as_json)
      expect(json_body).to match_array([{
        id: channel.id,
        name: channel.name,
        kind: channel.kind,
        config: channel.config
      },
      {
        id: websocket_channel.id,
        name: websocket_channel.name,
        kind: websocket_channel.kind,
        config: websocket_channel.config
      }])
    end

    it "is allowed for shared bots with publish role" do
      get :index, params: { bot_id: shared_bot.id }

      expect(response).to be_success
      expect(json_body).to all(be_a_channel_as_json)
    end

    it "is denied for shared bots without publish role" do
      get :index, params: { bot_id: other_shared_bot.id }

      expect(response).to be_denied
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

    it "is allowed for a channel from a shared bot with publish role" do
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

    it "is denied for a channel from a shared bot without publish role" do
      shared_channel = other_shared_bot.channels.first
      put :update, params: { id: shared_channel.id,
                             channel: {
                               name: "shared channel",
                               config: {
                                 "page_id" => "foo", "verify_token" => "bar", "access_token" => "baz"
                               }
                             }
                           }
      expect(response).to be_denied
    end
  end
end
