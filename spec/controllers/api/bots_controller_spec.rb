require 'rails_helper'

RSpec.describe Api::BotsController, type: :controller do
  let!(:user) { User.create! email: "user@example.com" }
  let!(:bot) { Bot.create_prepared!(user) }
  let!(:other_user) { User.create! email: "other_user@example.com" }
  let!(:other_bot) { Bot.create_prepared!(other_user) }

  before(:each) { sign_in user }

  describe "index" do
    it "returns the list of bots" do
      get :index

      expect(response).to be_success
      expect(json_body).to match_array([{ id: bot.id,
                                          name: bot.name,
                                          published: bot.published?,
                                          channel_setup: bot.channels.first.setup? }])
    end

    it "lists only the user bots" do
      get :index

      bot_ids = json_body.map { |bot| bot[:id] }
      expect(bot_ids).to include(bot.id)
      expect(bot_ids).to_not include(other_bot.id)
    end
  end

  describe "create" do
    it "creates a new bot" do
      expect do
        post :create
        expect(response).to be_success
      end.to change(Bot, :count).by(1)

      expect(json_body.keys).to match_array(%w(id name published channel_setup))
    end
  end

  describe "update" do
    it "can update the name" do
      put :update, params: { id: bot.id, bot: { name: "updated" } }

      expect(response).to be_success

      bot.reload
      expect(bot.name).to eq("updated")
    end
  end

  describe "destroy" do
    it "can delete a bot" do
      expect do
        delete :destroy, params: { id: bot.id }
      end.to change(Bot, :count).by(-1)
    end

    it "unpublishes a bot before deleting it" do
      bot.update_attributes! uuid: 'bot-id'

      expect(Backend).to receive(:destroy_bot).with('bot-id').and_return(true)

      delete :destroy, params: { id: bot.id }
    end
  end

  describe "publish" do
    it "publishes the bot manifest to the backend" do
      expect(Backend).to receive(:create_bot).and_return('bot-id')

      post :publish, params: { id: bot.id }

      expect(response).to be_success
      expect(bot.reload).to be_published
    end

    it "re-publishes an already published bot" do
      bot.update_attributes! uuid: 'bot-id'
      expect(Backend).to receive(:update_bot)

      post :publish, params: { id: bot.id }
    end
  end

  describe "unpublish" do
    it "unpublishes the bot from the backend" do
      bot.update_attributes! uuid: 'bot-id'
      expect(Backend).to receive(:destroy_bot).with('bot-id')

      delete :unpublish, params: { id: bot.id }

      expect(bot.reload).to_not be_published
    end
  end

  describe "data" do
    it "returns a CSV file" do
      get :data, params: { id: bot.id }

      expect(response).to be_success
    end
  end

  describe "stats" do
    let(:sample_summary) {
      { 'active_users' => 10,
        'messages_sent' => 20,
        'messages_received' => 30 }
    }
    let(:sample_users_per_skill) {
      [{ 'skill_id' => 'front_desk', 'count' => 10 },
       { 'skill_id' => 'language_detector', 'count' => 5 }]
    }

    it "fails if the bot is not yet published" do
      get :stats, params: { id: bot.id }

      expect(response.status).to eq(400)
    end

    it "returns the usage stats for the bot" do
      bot.update_attributes! uuid: 'bot-id'
      expect(Backend).to receive(:usage_summary).with('bot-id').and_return(sample_summary)
      expect(Backend).to receive(:users_per_skill).with('bot-id').and_return(sample_users_per_skill)

      get :stats, params: { id: bot.id }

      expect(response).to be_success
      expect(json_body).to match({ active_users: 10,
                                   messages_sent: 20,
                                   messages_received: 30,
                                   behaviours: [{ id: 'front_desk',
                                                  kind: 'front_desk',
                                                  label: 'Front desk',
                                                  users: 10 },
                                                { id: 'language_detector',
                                                  kind: 'language_detector',
                                                  label: 'Language detector',
                                                  users: 5 }] })
    end
  end
end
