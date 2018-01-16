require 'rails_helper'

RSpec.describe Api::BotsController, type: :controller do
  let!(:user) { create(:user) }

  let!(:bot) { create(:bot, owner: user) }
  let!(:published_bot) { create(:bot, :published, owner: user) }
  let!(:other_bot) { create(:bot) }

  before(:each) { sign_in user }

  describe "index" do
    it "returns a list of bots" do
      get :index

      expect(response).to be_success
      expect(json_body).to all(be_a_bot_as_json)
    end

    it "lists only the user accessible bots" do
      shared_bot = create(:bot, shared_with: user)

      get :index

      bot_ids = json_pluck(json_body, :id)
      expect(bot_ids).to include(bot.id, published_bot.id, shared_bot.id)
      expect(bot_ids).to_not include(other_bot.id)
    end
  end

  describe "create" do
    it "creates a new bot" do
      expect do
        post :create
        expect(response).to be_success
      end.to change(Bot, :count).by(1)

      expect(json_body).to be_a_bot_as_json
    end
  end

  describe "update" do
    it "can update the name" do
      put :update, params: { id: bot.id, bot: { name: "updated" } }

      expect(response).to be_success
      expect(json_body).to be_a_bot_as_json.matching(name: "updated")

      bot.reload
      expect(bot.name).to eq("updated")
    end

    it "cannot update a shared bot" do
      shared_bot = create(:bot, shared_with: user)

      put :update, params: { id: shared_bot.id, bot: { name: "updated" } }

      expect(response).not_to be_success

      shared_bot.reload
      expect(shared_bot.name).not_to eq("updated")
    end
  end

  describe "destroy" do
    it "can delete a bot" do
      expect do
        delete :destroy, params: { id: bot.id }
      end.to change(Bot, :count).by(-1)
    end

    it "unpublishes a bot before deleting it" do
      expect(Backend).to receive(:destroy_bot).with(published_bot.uuid).and_return(true)

      delete :destroy, params: { id: published_bot.id }
    end

    it "cannot delete a shared bot" do
      shared_bot = create(:bot, shared_with: user)

      expect do
        delete :destroy, params: { id: shared_bot.id }
      end.not_to change(Bot, :count)
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
      expect(Backend).to receive(:update_bot)

      post :publish, params: { id: published_bot.id }
    end

    it "is allowed for a shared bot with publish role" do
      shared_bot = create(:bot, shared_with: user, grants: %w(publish))

      expect(Backend).to receive(:create_bot).and_return('bot-id')

      post :publish, params: { id: shared_bot.id }

      expect(response).to be_success
    end

    it "is denied for a shared bot without publish role" do
      shared_bot = create(:bot, shared_with: user, grants: %w(results))

      post :publish, params: { id: shared_bot.id }
      expect(response).to be_denied
    end
  end

  describe "unpublish" do
    it "unpublishes the bot from the backend" do
      expect(Backend).to receive(:destroy_bot).with(published_bot.uuid)

      delete :unpublish, params: { id: published_bot.id }

      expect(published_bot.reload).to_not be_published
    end

    it "is allowed for a shared bot with publish role" do
      shared_published_bot = create(:bot, :published, shared_with: user, grants: %w(publish))
      expect(Backend).to receive(:destroy_bot).with(shared_published_bot.uuid)

      delete :unpublish, params: { id: shared_published_bot.id }

      expect(shared_published_bot.reload).to_not be_published
    end

    it "is denied for a shared bot without publish role" do
      shared_bot = create(:bot, :published, shared_with: user, grants: %w(results))

      delete :unpublish, params: { id: shared_bot.id }
      expect(response).to be_denied
    end
  end

  describe "duplicate" do
    it "duplicates the bot" do
      expect do
        post :duplicate, params: { id: bot.id }
      end.to change(Bot, :count).by(1)

      expect(json_body).to be_a_bot_as_json
    end
  end

  describe "data" do
    it "returns a CSV file" do
      get :data, params: { id: bot.id }, format: 'csv'
      expect(response).to be_success
    end

    it "returns a JSON file" do
      get :data, params: { id: bot.id }, format: 'json'
      expect(response).to be_success
    end

    it "is allowed for a shared bot with results role" do
      shared_bot = create(:bot, shared_with: user, grants: %w(results))
      get :data, params: { id: shared_bot.id }, format: 'csv'
      expect(response).to be_success
    end

    it "is denied for a shared bot without results role" do
      shared_bot = create(:bot, shared_with: user, grants: %w(content))
      get :data, params: { id: shared_bot.id }, format: 'csv'
      expect(response).to be_denied
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
      expect(Backend).to receive(:usage_summary).with(published_bot.uuid).and_return(sample_summary)
      expect(Backend).to receive(:users_per_skill).with(published_bot.uuid).and_return(sample_users_per_skill)

      get :stats, params: { id: published_bot.id }

      expect(response).to be_success
      expect(json_body).to be_a_bot_stats_as_json.matching(active_users: 10,
                                                           messages_sent: 20,
                                                           messages_received: 30,
                                                           behaviours: [match_attributes({ id: 'front_desk', users: 10 }),
                                                                        match_attributes({ id: 'language_detector', users: 5 })])
    end

    it "is allowed for shared bots with results role" do
      shared_published_bot = create(:bot, :published, shared_with: user, grants: %w(results))
      expect(Backend).to receive(:usage_summary).with(shared_published_bot.uuid).and_return(sample_summary)
      expect(Backend).to receive(:users_per_skill).with(shared_published_bot.uuid).and_return(sample_users_per_skill)

      get :stats, params: { id: shared_published_bot.id }

      expect(response).to be_success
      expect(json_body).to be_a_bot_stats_as_json
    end

    it "is denied for shared bots without results role" do
      shared_published_bot = create(:bot, :published, shared_with: user, grants: %w(content))

      get :stats, params: { id: shared_published_bot.id }

      expect(response).to be_denied
    end
  end
end
