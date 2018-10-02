require 'rails_helper'

RSpec.describe Api::BotsController, type: :controller do
  let!(:user) { create(:user) }

  let!(:bot) { create(:bot, owner: user) }
  let!(:published_bot) { create(:bot, :published, owner: user) }
  let!(:other_bot) { create(:bot) }

  before(:each) { sign_in user }

  describe "index" do
    it "returns a list of bots" do
      allow(GatherBotStats).to receive(:run) { { :active_users => 0 } }
      get :index

      expect(response).to be_success
      expect(json_body).to all(be_a_bot_as_json)
    end

    it "lists only the user accessible bots" do
      shared_bot = create(:bot, shared_with: user)

      allow(GatherBotStats).to receive(:run) { { :active_users => 0 } }
      get :index

      bot_ids = json_pluck(json_body, :id)
      expect(bot_ids).to include(bot.id, published_bot.id, shared_bot.id)
      expect(bot_ids).to_not include(other_bot.id)
    end
  end

  describe "preview" do
    it "previews a new bot" do
      expect(Backend).to receive(:create_bot) { 'bot preview uuid abc' }
      post :preview, params: { id: bot.id, access_token: "an access token" }
      expect(response).to be_success
      expect(json_body[:result]).to eq("ok")
      expect(json_body[:preview_uuid]).to eq("bot preview uuid abc")
      bot.reload
      expect(bot.preview_uuid).to eq('bot preview uuid abc')
    end

    it "previews an existing bot" do
      another_bot = create(:bot, preview_uuid: 'bot preview uuid bcd', owner: user)
      expect(Backend).to receive(:update_bot)
      expect {
        post :preview, params: { id: another_bot.id, access_token: "an access token" }
        another_bot.reload
        expect(response).to be_success
        expect(json_body[:result]).to eq("ok")
        expect(json_body[:preview_uuid]).to eq(another_bot.preview_uuid)
      }.not_to change(another_bot, :preview_uuid)
    end

    it "previews an existing bot with no session" do
      another_bot = create(:bot, preview_uuid: 'a preview uuid', owner: user)
      expect(Backend).to receive(:update_bot)
      post :preview, params: { id: another_bot.id, access_token: "an access token" }
      expect(response).to be_success
      expect(json_body[:result]).to eq("ok")
      expect(json_body.keys).to include("session_uuid")
      expect(json_body[:session_uuid]).to be_nil
    end

    it "previews an existing bot when current user has a session" do
      another_bot = create(:bot, preview_uuid: 'a preview uuid', owner: user)
      create(:session, user: user, bot: another_bot, session_uuid: "session uuid abc")
      expect(Backend).to receive(:update_bot)
      post :preview, params: { id: another_bot.id, access_token: "an access token" }
      expect(response).to be_success
      expect(json_body[:result]).to eq("ok")
      expect(json_body[:session_uuid]).to eq("session uuid abc")
    end

    it "previews an existing bot with current user session when bot has others" do
      collaborator1 = create(:user)
      collaborator2 = create(:user)
      another_bot = create(:bot, preview_uuid: 'a preview uuid', owner: user)
      create(:collaborator, bot: another_bot, user:collaborator1)
      create(:collaborator, bot: another_bot, user:collaborator2)
      create(:session, user: collaborator1, bot: another_bot, session_uuid: "session uuid def")
      create(:session, user: user, bot: another_bot, session_uuid: "session uuid efg")
      create(:session, user: collaborator2, bot: another_bot, session_uuid: "session uuid fgh")
      expect(Backend).to receive(:update_bot)
      post :preview, params: { id: another_bot.id, access_token: "an access token" }
      expect(response).to be_success
      expect(json_body[:result]).to eq("ok")
      expect(json_body[:session_uuid]).to eq("session uuid efg")
    end

    it "previews an existing bot with collaborator session when bot has other from owner" do
      another_user = create(:user)
      another_bot = create(:bot, preview_uuid: 'a preview uuid', owner: another_user)
      create(:collaborator, bot: another_bot, user: user)
      create(:session, user: another_user, bot: another_bot, session_uuid: "session uuid a")
      create(:session, user: user, bot: another_bot, session_uuid: "session uuid b")
      expect(Backend).to receive(:update_bot)
      post :preview, params: { id: another_bot.id, access_token: "an access token" }
      expect(response).to be_success
      expect(json_body[:result]).to eq("ok")
      expect(json_body[:session_uuid]).to eq("session uuid b")
    end

  end


  describe "set a session" do
    it "creates a session from owner" do
      expect do
        post :set_session, params: { id: bot.id, session_uuid: 'session uuid ghi' }
        expect(response).to be_success
      end.to change(Session, :count).by(1)
      expect(json_body[:result]).to eq("ok")
      expect(json_body[:session_uuid]).to eq("session uuid ghi")
      expect(bot.get_session(user)).to_not be_nil
      expect(bot.get_session(user).session_uuid).to eq("session uuid ghi")
    end

    it "updates a session from owner" do
      create(:session, user: user, bot: bot, session_uuid: "session uuid hij")
      expect do
        post :set_session, params: { id: bot.id, session_uuid: 'session uuid ijk' }
        expect(response).to be_success
      end.to_not change(Session, :count)
      expect(json_body[:result]).to eq("ok")
      expect(json_body[:session_uuid]).to eq("session uuid ijk")
      expect(bot.get_session(user).session_uuid).to eq("session uuid ijk")
    end

    it "creates a session from collaborator" do
      another_user = create(:user)
      another_bot = create(:bot, owner: another_user)
      create(:collaborator, bot: another_bot, user:user)
      expect do
        post :set_session, params: { id: another_bot.id, session_uuid: 'session uuid jkl' }
        expect(response).to be_success
      end.to change(Session, :count).by(1)
      expect(json_body[:result]).to eq("ok")
      expect(json_body[:session_uuid]).to eq("session uuid jkl")
      expect(another_bot.get_session(user)).to_not be_nil
      expect(another_bot.get_session(user).session_uuid).to eq("session uuid jkl")
    end

    it "updates a session from collaborator" do
      another_user = create(:user)
      another_bot = create(:bot, owner: another_user)
      create(:collaborator, bot: another_bot, user:user)
      create(:session, user: user, bot: another_bot, session_uuid: "session uuid klm")
      expect do
        post :set_session, params: { id: another_bot.id, session_uuid: 'session uuid lmn' }
        expect(response).to be_success
      end.to_not change(Session, :count)
      expect(json_body[:result]).to eq("ok")
      expect(json_body[:session_uuid]).to eq("session uuid lmn")
      expect(another_bot.get_session(user).session_uuid).to eq("session uuid lmn")
    end

    it "does has access from unauthorized" do
      another_user = create(:user)
      another_bot = create(:bot, owner: another_user)
      expect do
        post :set_session, params: { id: another_bot.id, session_uuid: 'session uuid mno' }
        expect(response).to_not be_success
      end.to_not change(Session, :count)
      expect(json_body[:error]).to eq("Forbidden")
      expect(another_bot.get_session(user)).to be_nil
    end

    it "does not update a session of another user when it creates a session" do
      another_user = create(:user)
      create(:collaborator, bot: bot, user:another_user)
      create(:session, user: another_user, bot: bot, session_uuid: "session uuid pqr")
      expect do
        post :set_session, params: { id: bot.id, session_uuid: 'session uuid rst' }
        expect(response).to be_success
      end.to change(Session, :count).by(1)
      expect(json_body[:result]).to eq("ok")
      expect(json_body[:session_uuid]).to eq("session uuid rst")
      expect(bot.get_session(user)).to_not be_nil
      expect(bot.get_session(user).session_uuid).to eq("session uuid rst")
      expect(bot.get_session(another_user)).to_not be_nil
      expect(bot.get_session(another_user).session_uuid).to eq("session uuid pqr")
    end

    it "does not update a session of another user when it updates a session" do
      another_user = create(:user)
      create(:collaborator, bot: bot, user:another_user)
      create(:session, user: another_user, bot: bot, session_uuid: "session uuid stu")
      create(:session, user: user, bot: bot, session_uuid: "session uuid tuv")
      expect do
        post :set_session, params: { id: bot.id, session_uuid: 'session uuid uvw' }
        expect(response).to be_success
      end.to_not change(Session, :count)
      expect(json_body[:result]).to eq("ok")
      expect(json_body[:session_uuid]).to eq("session uuid uvw")
      expect(bot.get_session(user)).to_not be_nil
      expect(bot.get_session(user).session_uuid).to eq("session uuid uvw")
      expect(bot.get_session(another_user)).to_not be_nil
      expect(bot.get_session(another_user).session_uuid).to eq("session uuid stu")
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
      expect(Backend).to receive(:create_bot).and_return('a bot id')

      post :publish, params: { id: bot.id }

      expect(response).to be_success
      expect(bot.reload).to be_published
      expect(JSON.parse(response.body)['uuid']).to eq('a bot id')
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
    let(:sample_session_data) {
      [
        {
          'id' => 'ecbb5615-04d4-4733-a030-770f84efca39',
          'data' => {
            'survey/20/pizza' => [
              'cheese',
              'pepperoni'
            ],
            'survey/20/likes_pizza' => 'yes',
            'survey/19/pizza' => [
              'cheese'
            ],
            'survey/19/likes_pizza' => 'yes',
            'language' => 'en'
          },
          'assets' => [
            {
              'timestamp' => '2018-07-16T22:24:05.579900',
              'skill_id' => '19',
              'data' => {
                'survey/19/pizza' => [
                  'cheese'
                ],
                'survey/19/likes_pizza' => 'yes'
              }
            },
            {
              'timestamp' => '2018-07-16T22:24:22.511015',
              'skill_id' => '20',
              'data' => {
                'survey/20/pizza' => [
                  'cheese',
                  'other'
                ],
                'survey/20/likes_pizza' => 'yes'
              }
            },
            {
              'timestamp' => '2018-07-16T22:25:21.910896',
              'skill_id' => '20',
              'data' => {
                'survey/20/pizza' => [
                  'cheese',
                  'pepperoni'
                ],
                'survey/20/likes_pizza' => 'yes'
              }
            }
          ]
        },
        {
          'id' => 'b97a5222-4c4f-41c9-bcf2-ff126b06e402',
          'data' => {
            'survey/19/pizza' => [
              "other"
            ],
            'survey/19/likes_pizza' => 'no',
            'language' => 'en'
          },
          'assets' => [
            {
              'timestamp' => '2018-07-16T22:16:18.073170',
              'skill_id' => '19',
              'data' => {
                'survey/19/pizza' => [
                  'other'
                ],
                'survey/19/likes_pizza' => 'yes'
              }
            },
            {
              'timestamp' => '2018-07-16T22:23:31.744635',
              'skill_id' => '19',
              'data' => {
                'survey/19/pizza' => [
                  'other'
                ],
                'survey/19/likes_pizza' => 'no'
              }
            }
          ]
        }
      ]
    }

    let(:result_csv) {
      "id,survey/20/pizza,survey/20/likes_pizza,survey/19/pizza,survey/19/likes_pizza,language,survey/19/pizza_0,survey/19/likes_pizza_0,survey/20/pizza_0,survey/20/likes_pizza_0,survey/20/pizza_1,survey/20/likes_pizza_1,survey/19/pizza_1,survey/19/likes_pizza_1\necbb5615-04d4-4733-a030-770f84efca39,\"cheese, pepperoni\",yes,cheese,yes,en,cheese,yes,\"cheese, other\",yes,\"cheese, pepperoni\",yes,\"\",\"\"\nb97a5222-4c4f-41c9-bcf2-ff126b06e402,,,other,no,en,other,yes,\"\",\"\",\"\",\"\",other,no\n"
    }

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

    it "builds a csv with assets" do
      expect(Backend).to receive(:session_data).with(published_bot.uuid, 'all').and_return(sample_session_data)

      get :data, params: { id: published_bot.id, period: 'all' }, format: 'csv'
      expect(response.body).to eq(result_csv)
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
      expect(Backend).to receive(:usage_summary).with(published_bot.uuid, period: "this_week").and_return(sample_summary)
      expect(Backend).to receive(:users_per_skill).with(published_bot.uuid, period: "this_week").and_return(sample_users_per_skill)

      get :stats, params: { id: published_bot.id, period: "this_week" }

      expect(response).to be_success
      expect(json_body).to be_a_bot_stats_as_json.matching(active_users: 10,
                                                           messages_sent: 20,
                                                           messages_received: 30,
                                                           behaviours: [match_attributes({ id: 'front_desk', users: 10 }),
                                                                        match_attributes({ id: 'language_detector', users: 5 })])
    end

    it "is allowed for shared bots with results role" do
      shared_published_bot = create(:bot, :published, shared_with: user, grants: %w(results))
      expect(Backend).to receive(:usage_summary).with(shared_published_bot.uuid, period: "this_month").and_return(sample_summary)
      expect(Backend).to receive(:users_per_skill).with(shared_published_bot.uuid, period: "this_month").and_return(sample_users_per_skill)

      get :stats, params: { id: shared_published_bot.id, period: "this_month" }

      expect(response).to be_success
      expect(json_body).to be_a_bot_stats_as_json
    end

    it "is denied for shared bots without results role" do
      shared_published_bot = create(:bot, :published, shared_with: user, grants: %w(content))

      get :stats, params: { id: shared_published_bot.id }

      expect(response).to be_denied
    end
  end

  describe "error_logs" do
    let(:sample_error_logs) {
      [{
        'timestamp' => '1234',
        'bot_id' => '1234',
        'session_id' => '1234',
        'skill_id' => '1234',
        'message' => '1234'
      }]
    }

    it "fails if the bot is not yet published" do
      get :stats, params: { id: bot.id }

      expect(response.status).to eq(400)
    end

    it "returns the error logs for the bot" do
      expect(Backend).to receive(:error_logs).with(published_bot.uuid, period: "this_week").and_return(sample_error_logs)

      get :error_logs, params: { id: published_bot.id, period: "this_week" }

      expect(response).to be_success
      expect(json_body.first).to be_a_bot_error_log_as_json.matching(timestamp: '1234',
                                                                bot_id: '1234',
                                                                session_id: '1234',
                                                                skill_id: '1234',
                                                                message: '1234')
    end
  end
end
