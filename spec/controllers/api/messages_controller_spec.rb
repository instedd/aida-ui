require 'rails_helper'

RSpec.describe Api::MessagesController, type: :controller do
  let!(:user) { create(:user) }
  before(:each) { sign_in user }
  let!(:bot) { create(:bot, owner: user) }

  describe 'answer' do
    let!(:notification) { create(:notification, bot: bot, notification_type: 'human_override', data: { bot_id: '', session_id: '' }) }

    it 'does not resolve notification' do
      expect(notification.resolved).to eq(false)
      allow(Backend).to receive(:sessions_send_message)
      post :answer, params: { id: notification.id }
      expect(response).to be_success
      notification.reload
      expect(notification.resolved).to eq(false)
    end
  end
end
