require 'rails_helper'

RSpec.describe Api::SkillsController, type: :controller do
  let!(:user) { User.create! email: "user@example.com" }
  before(:each) { sign_in user }
  let!(:bot) { Bot.create_prepared!(user) }

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
  end

  describe "create" do
    it "creates a new skill given a type" do
      expect do
        post :create, params: { bot_id: bot.id, skill_kind: "language_detector" }
      end.to change(bot.skills, :count).by(1)

      expect(response.status).to eq(201)
      expect(json_body['kind']).to eq("language_detector")
    end

    it "rejects invalid skill types" do
      post :create, params: { bot_id: bot.id, skill_kind: "invalid_type" }
      expect(response.status).to eq(400)

      expect(bot.skills.count).to be_zero
    end
  end

  describe "update" do
    let!(:skill) { bot.behaviours.create_skill! "language_detector", order: 1 }

    it "updates valid skills" do
      put :update, params: {
            id: skill.id, skill: {
              name: "Lang Detector",
              enabled: false,
              config: {
                explanation: "Say 'english'",
                languages: [{code: 'en', keywords: 'english'}]
              }
            }
          }

      expect(response).to be_success

      skill.reload
      expect(skill.name).to eq('Lang Detector')
      expect(skill).to_not be_enabled
      expect(skill.config['explanation']).to eq("Say 'english'")
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
  end
end
