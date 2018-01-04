require 'rails_helper'

RSpec.describe Api::FrontDesksController, type: :controller do
  let!(:user) { User.create! email: "user@example.com" }
  before(:each) { sign_in user }
  let!(:bot) { Bot.create_prepared!(user) }

  describe "show" do
    it "retrieves front desk configuration" do
      get :show, params: { bot_id: bot.id }

      expect(json_body['id']).to eq(bot.front_desk.id)
      expect(json_body['config']).to match(bot.front_desk.config)
    end
  end

  describe "update" do
    it "can update front desk behaviour configuration" do
      put :update, params: {
            bot_id: bot.id,
            front_desk: {
              config: {
                greeting: "hello",
                introduction: "i'm a bot",
                not_understood: "i didn't understand",
                clarification: "what do you mean?",
                threshold: 0.5
              }
            }
          }, as: :json

      expect(response).to be_success
      bot.reload

      expect(bot.front_desk.config['greeting']).to eq('hello')
    end
  end
end
