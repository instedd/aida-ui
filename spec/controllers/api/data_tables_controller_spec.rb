require 'rails_helper'

RSpec.describe Api::DataTablesController, type: :controller do
  let!(:user) { create(:user) }
  let!(:bot) { create(:bot, owner: user) }
  let!(:shared_bot) { create(:bot, shared_with: user, grants: %w(variables)) }
  let!(:other_bot) { create(:bot, shared_with: user, grants: %w(results)) }

  let!(:data_table) { create(:data_table, bot: bot, data: [%w(key value), %w(foo bar)]) }
  let!(:shared_data_table) { create(:data_table, bot: shared_bot, data: [%w(key value), [1, 2]]) }

  before(:each) { sign_in user }

  describe "index" do
    it "fetches all the data tables" do
      get :index, params: { bot_id: bot.id }
      expect(response).to be_success
      expect(json_body).to all(be_a_data_table_as_json)
      expect(json_body[0]['columns']).to match_array(%w(key value))
    end

    it "is allowed on a shared bot with variables role" do
      get :index, params: { bot_id: shared_bot.id }
      expect(response).to be_success
      expect(json_body).to all(be_a_data_table_as_json)
    end

    it "is denied on a shared bot without variables role" do
      get :index, params: { bot_id: other_bot.id }
      expect(response).to be_denied
    end
  end
end
