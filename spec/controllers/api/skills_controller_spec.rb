require 'rails_helper'

RSpec.describe Api::SkillsController, type: :controller do
  let!(:user) { create(:user) }
  before(:each) { sign_in user }
  let!(:bot) { create(:bot, owner: user) }

  let!(:shared_bot) { create(:bot, shared_with: user, grants: %w(behaviour)) }
  let!(:shared_skill) { shared_bot.skills.create_skill! "keyword_responder", order: 1 }

  let!(:other_shared_bot) { create(:bot, shared_with: user, grants: %w(results)) }
  let!(:other_shared_skill) { other_shared_bot.skills.create_skill! "keyword_responder", order: 1 }

  describe "index" do
    it "fetches all the behaviours except front_desk" do
      get :index, params: { bot_id: bot.id }
      expect(response).to be_success
      expect(json_body).to match([])

      skill = bot.behaviours.create_skill! "language_detector", order: 1

      get :index, params: { bot_id: bot.id }
      expect(json_body.size).to eq(1)
      expect(json_body).to match_array([{
                                          id: skill.id,
                                          kind: skill.kind,
                                          name: skill.name,
                                          config: skill.config,
                                          enabled: skill.enabled,
                                          order: skill.order
                                        }])
    end

    it "is allowed for shared bots with behaviour role" do
      get :index, params: { bot_id: shared_bot.id }
      expect(response).to be_success
      expect(json_body).to all(be_a_skill_as_json)
    end

    it "is denied for shared bots without behaviour role" do
      get :index, params: { bot_id: other_shared_bot.id }
      expect(response).to be_denied
    end
  end

  describe "create" do
    it "creates a new skill given a type" do
      expect do
        post :create, params: { bot_id: bot.id, kind: "language_detector" }
      end.to change(bot.skills, :count).by(1)

      expect(response.status).to eq(201)
      expect(json_body).to be_a_skill_as_json
      expect(json_body['kind']).to eq("language_detector")
    end

    it "creates a new skill with a given name" do
      post :create, params: { bot_id: bot.id, kind: "keyword_responder", name: "Test" }

      expect(response.status).to eq(201)
      expect(json_body['kind']).to eq("keyword_responder")
      expect(json_body['name']).to eq("Test")
    end

    it "rejects invalid skill types" do
      post :create, params: { bot_id: bot.id, kind: "invalid_type" }
      expect(response.status).to eq(400)

      expect(bot.skills.count).to be_zero
    end

    it "is allowed for shared bots with behaviour role" do
      post :create, params: { bot_id: shared_bot.id, kind: "keyword_responder", name: "skill" }

      expect(response.status).to eq(201)
      expect(json_body).to be_a_skill_as_json.matching(kind: 'keyword_responder', name: 'skill')
    end

    it "is denied for shared bots without behaviour role" do
      post :create, params: { bot_id: other_shared_bot.id, kind: "keyword_responder", name: "skill" }

      expect(response).to be_denied
    end
  end

  describe "update" do
    let!(:skill) { bot.behaviours.create_skill! "keyword_responder", order: 1 }
    let(:valid_skill_config) {
      {
        name: "Food menu",
        enabled: false,
        config: {
          explanation: "I can give you the menu",
          keywords: "menu,food",
          clarification: "To get the menu say 'menu'",
          response: "The menu"
        }
      }
    }

    it "updates valid skills" do
      put :update, params: { id: skill.id, skill: valid_skill_config }

      expect(response).to be_success

      skill.reload
      expect(skill.name).to eq('Food menu')
      expect(skill).to_not be_enabled
      expect(skill.config['explanation']).to eq("I can give you the menu")
    end

    it "does not update front desk" do
      put :update, params: {
            id: bot.front_desk.id, skill: {
              name: "Test"
            }
          }

      expect(response.status).to eq(404)

      bot.reload
      expect(bot.front_desk.name).to_not eq('Test')
    end

    it "is allowed for shared bots with behaviour role" do
      put :update, params: { id: shared_skill.id, skill: valid_skill_config }

      expect(response).to be_success
      shared_skill.reload
      expect(shared_skill.name).to eq('Food menu')
    end

    it "is denied for shared bots without behaviour role" do
      put :update, params: { id: other_shared_skill.id, skill: valid_skill_config }

      expect(response).to be_denied
    end
  end

  describe "destroy" do
    let!(:skill) { bot.behaviours.create_skill! "language_detector", order: 1 }

    it "destroys existing skills" do
      expect do
        delete :destroy, params: { id: skill.id }
      end.to change(bot.skills, :count).by(-1)
      expect(response).to be_ok
    end

    it "does not destroy front desk" do
      delete :destroy, params: { id: bot.front_desk.id }
      expect(response.status).to eq(404)
    end

    it "is allowed for shared bots with behaviour role" do
      expect do
        delete :destroy, params: { id: shared_skill.id }
      end.to change(shared_bot.skills, :count).by(-1)
    end

    it "is denied for shared bots without behaviour role" do
      delete :destroy, params: { id: other_shared_skill.id }
      expect(response).to be_denied
    end
  end
end
