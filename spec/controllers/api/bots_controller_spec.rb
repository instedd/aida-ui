require 'rails_helper'

RSpec.describe Api::BotsController, type: :controller do
  describe "index" do
    it "ensures a bot exists" do
      expect(Bot.count).to eq(0)
      get :index
      expect(Bot.count).to eq(1)
    end
  end

  describe "update" do
    let!(:bot) { Bot.create! name: "original" }

    it "can update the name" do
      put :update, params: { id: bot.id, bot: { name: "updated" } }
      bot.reload
      expect(bot.name).to eq("updated")
    end
  end
end
