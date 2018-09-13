require 'rails_helper'

RSpec.describe Notification, type: :model do
  it 'initialize with uuid' do
    notification = Notification.new
    expect(notification.uuid).to_not be_nil
  end

  describe 'human_override' do
    let!(:bot) { create(:bot, owner: create(:user)) }
    let(:notification) { bot.notifications.create({
      type: 'human_override',
      data: {
        'message': 'a message',
        'bot_id': 'a bot id',
        'session_id': 'a session id',
        'name': 'a name'
      },
      uuid: 'a uuid'
    })}

    let(:other_notification) { bot.notifications.create({
      type: 'other',
      data: {}
    })}

    let(:uto_message) {{"type"=>"text", "direction"=>"uto", "content"=>"user to operator message"}}
    let(:otu_message) {{"type"=>"text", "direction"=>"otu", "content"=>"operator user message"}}
    let(:message_without_required) {{"type"=>"text"}}
    let(:message_with_additional) {{"type"=>"text", "direction"=>"otu", "content"=>"operator user message", "other"=>"other"}}

    it 'adds messages' do
      expect(notification.messages().length).to eq(0)
      notification.add_message!(uto_message)
      expect(notification.messages().length).to eq(1)
      expect(notification.messages()[0].except("timestamp")).to eq(uto_message)
      notification.add_message!(otu_message)
      expect(notification.messages().length).to eq(2)
      expect(notification.messages()[1].except("timestamp")).to eq(otu_message)
    end

    it 'adds a timestamp to the message' do
      notification.add_message!(uto_message)
      timestamp = notification.messages()[0]['timestamp']
      expect(timestamp).to_not be_nil
      expect(timestamp).to be > Time.now.getutc - 60
    end

    it 'rejects invalid messages' do
      expect { notification.add_message!(message_without_required) }.to raise_error('invalid message')
      expect { notification.add_message!(message_with_additional) }.to raise_error('invalid message')
    end

    it 'rejects messages for other types' do
      expect { other_notification.add_message!(uto_message) }.to raise_error('messages only supported for a human_override notification')
    end

    it 'sets bot_forwarding_messages' do
      expect(notification.bot_forwarding_messages?()).to be false
      notification.bot_forwarding_messages!(true)
      expect(notification.bot_forwarding_messages?()).to be true
      notification.bot_forwarding_messages!(false)
      expect(notification.bot_forwarding_messages?()).to be false
    end

    it 'rejects setting bot_forwarding_messages for other types' do
      expect { other_notification.bot_forwarding_messages!(true) }.to raise_error('bot_forwarding_messages only supported for a human_override notification')
    end
  end
end
