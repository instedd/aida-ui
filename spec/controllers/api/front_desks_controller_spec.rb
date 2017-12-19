require 'rails_helper'

RSpec.describe Api::FrontDesksController, type: :controller do
  let!(:user) { create(:user) }
  before(:each) { sign_in user }
  let!(:bot) { create(:bot, owner: user) }
  let!(:shared_bot) { create(:bot, shared_with: user) }

  describe "show" do
    it "retrieves front desk configuration" do
      get :show, params: { bot_id: bot.id }

      expect(json_body['id']).to eq(bot.front_desk.id)
      expect(json_body['config']).to match(bot.front_desk.config)
    end

    it "is allowed for shared bots" do
      get :show, params: { bot_id: shared_bot.id }

      expect(response).to be_success
      expect(json_body).to match_attributes(id: shared_bot.front_desk.id)
    end
  end

  describe "update" do
    let(:valid_front_desk_config) {
      {
        greeting: "hello",
        introduction: "i'm a bot",
        not_understood: "i didn't understand",
        clarification: "what do you mean?",
        threshold: 0.5
      }
    }

    it "can update front desk behaviour configuration" do
      put :update, params: {
            bot_id: bot.id,
            front_desk: { config: valid_front_desk_config }
          }, as: :json

      expect(response).to be_success
      bot.reload

      expect(bot.front_desk.config['greeting']).to eq('hello')
    end

    it "is allowed for shared bots" do
      put :update, params: {
            bot_id: shared_bot.id,
            front_desk: { config: valid_front_desk_config }
          }, as: :json

      expect(response).to be_success
      shared_bot.reload

      expect(shared_bot.front_desk.config['greeting']).to eq('hello')
    end
  end
end
