require 'rails_helper'

RSpec.describe Api::BotsController, type: :controller do
  let!(:user) { User.create! email: "user@example.com" }
  before(:each) { sign_in user }

  describe "index" do
    let!(:bot) { Bot.create_prepared!(user) }

    it "returns the list of bots" do
      get :index

      expect(response).to be_success
      expect(json_body).to match_array([{ id: bot.id,
                                          name: bot.name,
                                          published: bot.published?,
                                          channel_setup: bot.channels.first.setup? }])
    end
  end

  describe "update" do
    let!(:bot) { Bot.create_prepared!(user) }

    it "can update the name" do
      put :update, params: { id: bot.id, bot: { name: "updated" } }
      bot.reload
      expect(bot.name).to eq("updated")
    end
  end

  describe "destroy" do
    let!(:bot) { Bot.create_prepared!(user) }

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
end
