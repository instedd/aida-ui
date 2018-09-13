require 'rails_helper'

RSpec.describe Api::MessagesController, type: :controller do
  let!(:user) { create(:user) }
  before(:each) { sign_in user }
  let!(:bot) { create(:bot, owner: user) }

  describe 'resolve' do
    let!(:notification) { create(:notification, bot: bot, notification_type: 'human_override', data: { bot_id: '', session_id: '' }) }

    it 'sets the bot free' do
      notification.bot_forwarding_messages!(true)
      expect(notification.resolved).to eq(false)
      expect(Backend).to receive(:sessions_forward_messages) {{'forward_messages_id' => ''}}
      post :resolve, params: { id: notification.id }
      expect(response).to be_success
      notification.reload
      expect(notification.bot_forwarding_messages?()).to eq(false)
      expect(notification.resolved).to eq(true)
    end
  end

  describe 'answer' do
    let!(:notification) { create(:notification, bot: bot, notification_type: 'human_override', data: { bot_id: '', session_id: '' }) }

    it 'does not resolve notification' do
      expect(notification.resolved).to eq(false)
      allow(Backend).to receive(:sessions_send_message)
      allow(Backend).to receive(:sessions_forward_messages) {{'forward_messages_id' => notification.uuid}}
      post :answer, params: { id: notification.id, answer: 'a message' }
      expect(response).to be_success
      notification.reload
      expect(notification.resolved).to eq(false)
    end

    it 'returns the created message' do
      allow(Backend).to receive(:sessions_send_message)
      allow(Backend).to receive(:sessions_forward_messages) {{'forward_messages_id' => notification.uuid}}
      result = post :answer, params: { id: notification.id, answer: 'a message' }

      message = JSON.parse(result.body)['message']
      expect(message.except('timestamp')).to eq({
        'type' => 'text',
        'direction' => 'otu',
        'content' => 'a message'
      })
    end

    it 'takes control of the bot' do
      expect(notification.bot_forwarding_messages?()).to eq(false)
      allow(Backend).to receive(:sessions_send_message)
      expect(Backend).to receive(:sessions_forward_messages) {{'forward_messages_id' => notification.uuid}}
      post :answer, params: { id: notification.id, answer: 'a message' }
      expect(response).to be_success
      notification.reload
      expect(notification.bot_forwarding_messages?()).to eq(true)
    end

    it 'does not call the backend when already forwarding' do
      notification.bot_forwarding_messages!(true)
      notification.save!
      allow(Backend).to receive(:sessions_send_message)
      expect(Backend).not_to receive(:sessions_forward_messages)
      post :answer, params: { id: notification.id, answer: 'a message' }
      expect(response).to be_success
    end

    it 'rejects an answer with no message' do
      post :answer, params: { id: notification.id }
      expect(response).to_not be_success
      expect(response.status).to eq(422)
      expect(response.body).to eq('{"error":"missing answer"}')
    end

    it 'rejects an answer with an empty message' do
      post :answer, params: { id: notification.id, answer: '' }
      expect(response).to_not be_success
      expect(response.status).to eq(422)
      expect(response.body).to eq('{"error":"empty answer"}')
    end

    it 'sends the message to the user' do
      allow(Backend).to receive(:sessions_forward_messages) {{'forward_messages_id' => notification.uuid}}
      expect(Backend).to receive(:sessions_send_message)
      post :answer, params: { id: notification.id, answer: 'a message' }
      expect(response).to be_success
    end

    it 'adds the message to the notification' do
      expect(notification.messages.length).to eq(0)
      allow(Backend).to receive(:sessions_send_message)
      allow(Backend).to receive(:sessions_forward_messages) {{'forward_messages_id' => notification.uuid}}
      post :answer, params: { id: notification.id, answer: 'an answer' }
      expect(response).to be_success
      notification.reload
      expect(notification.messages[0].except("timestamp")).to eq({
        'type' => 'text',
        'direction' => 'otu',
        'content' => 'an answer'
      })
    end
  end
end
