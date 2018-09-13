require 'rails_helper'

RSpec.describe Api::NotificationsController, type: :controller do
  let!(:user) { create(:user) }
  let!(:bot) { create(:bot, owner: user) }

  let(:policy_enforcement_block_notification_reason) {
    'The bot violated our Platform Policies (https://developers.facebook.com/policy/#messengerplatform). Common violations include sending out excessive spammy messages or being non-functional.'
  }
  let(:policy_enforcement_block_notification) {
     JSON.dump({
      type: "policy_enforcement",
      data: {
        "action": "block",
        "reason": policy_enforcement_block_notification_reason
      }
    })
  }

  describe "POST create_message" do

    let(:message_0) {
      JSON.dump({
        type: 'text',
        direction: 'uto',
        content: 'user to operator message 0'
    })}

    let(:message) {
      JSON.dump({
        type: 'text',
        direction: 'uto',
        content: 'user to operator message 1'
    })}

    it "rejects an unexistent notification" do
      post :create_message, params: {notifications_secret: bot.notifications_secret, uuid: 'unexistent-uuid' }, body: message
      expect(response).to_not be_success
      expect(response.status).to eq(404)
      expect(response.body).to eq("{\"error\":\"Notification not found\"}")
    end

    context "human override notification" do
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

      it "creates a message" do
        notification.add_message!(JSON.parse(message_0))
        notification.save!

        post :create_message, params: {notifications_secret: bot.notifications_secret, uuid: notification.uuid }, body: message
        expect(response).to be_success

        notification.reload
        expect(notification.messages()[1].except("timestamp")).to eq(JSON.parse(message))
      end

      it "rejects an unknown notification secret" do
        post :create_message, params: {notifications_secret: 'unknown notifications_secret', uuid: notification.uuid }, body: message
        expect(response).to_not be_success
        expect(response.status).to eq(401)
        expect(response.body).to eq("{\"error\":\"Unknown notification secret\"}")
      end

      it "rejects another bot notification secret" do
        another_bot = create(:bot, owner: user)
        post :create_message, params: {notifications_secret: another_bot.notifications_secret, uuid: notification.uuid }, body: message
        expect(response).to_not be_success
        expect(response.status).to eq(401)
        expect(response.body).to eq("{\"error\":\"Invalid notification secret\"}")
      end
    end

    context "other types" do
      let(:notification) { bot.notifications.create({
        type: 'other type',
        data: {},
        uuid: 'a uuid'
      })}

      it "rejects message creation" do
        post :create_message, params: {notifications_secret: bot.notifications_secret, uuid: notification.uuid }, body: message
        expect(response).to_not be_success
        expect(response.status).to eq(400)
        expect(response.body).to eq("{\"error\":\"Unsupported notification type\"}")
      end
    end
  end

  describe "POST #create" do
    context "human override" do
      let(:human_override_notification) {
        JSON.dump({
          type: 'human_override',
          data: {
            'message': 'first message',
            'bot_id': 'a bot id',
            'session_id': 'a session id',
            'name': 'a name'
          }
        })
      }

      it "creates the notification" do
        expect {
          post :create, params: {notifications_secret: bot.notifications_secret}, body: human_override_notification
        }.to change(Notification, :count).by(1)
        expect(response).to be_success

        expect(Notification.last.notification_type).to eq("human_override")
      end

      it "adds no message" do
        post :create, params: {notifications_secret: bot.notifications_secret}, body: human_override_notification
        expect(Notification.last.messages().length()).to eq(0)
      end
  end

    context "with valid params" do
      it "creates a new Notification by bot secret" do
        expect {
          post :create, params: {notifications_secret: bot.notifications_secret}, body: policy_enforcement_block_notification
        }.to change(Notification, :count).by(1)
        expect(response).to be_success
        expect(Notification.last.notification_type).to eq("policy_enforcement")
        expect(Notification.last.data.keys).to match_array(["reason", "action"])
        expect(Notification.last.data['action']).to eq("block")
      end

      it "creates a new Notification with an unknown type" do
        expect {
          post :create, params: {notifications_secret: bot.notifications_secret}, body: JSON.dump({ type: 'an-unknown-type', data: {}})
        }.to change(Notification, :count).by(1)
        expect(response).to be_success
        expect(Notification.last.notification_type).to eq('an-unknown-type')
        expect(Notification.last.data).to be_empty
      end

      it "emails block notifications" do
        expect {
          post :create, params: {notifications_secret: bot.notifications_secret}, body: policy_enforcement_block_notification
        }.to change(ActionMailer::Base.deliveries, :count).by(1)

        expect(response).to be_success
        email = ActionMailer::Base.deliveries.last
        expect(email).not_to be_nil
        expect(email.to).to match_array([user.email])
        expect(email.from).to match_array(['aida@instedd.org'])
        expect(email.subject).to include('blocked by Policy Enforcement')
        expect(email.body.encoded).to include(policy_enforcement_block_notification_reason)
      end

      it "doesn't email unblock notifications" do
        expect {
          post :create, params: {notifications_secret: bot.notifications_secret}, body: JSON.dump({
            type: "policy_enforcement",
            data: { "action": "unblock" }
          })
        }.not_to change(ActionMailer::Base.deliveries, :count)
        expect(response).to be_success
      end

      it "doesn't email unknown action notifications" do
        expect {
          post :create, params: {notifications_secret: bot.notifications_secret}, body: JSON.dump({
            type: "policy_enforcement",
            data: { "action": "unknown-action" }
          })
        }.not_to change(ActionMailer::Base.deliveries, :count)
        expect(response).to be_success
      end

      it "doesn't email unknown notifications" do
        expect {
          post :create, params: {notifications_secret: bot.notifications_secret}, body: JSON.dump({
            type: "unknown-type"
          })
        }.not_to change(ActionMailer::Base.deliveries, :count)
        expect(response).to be_success
      end
    end

    context "error handling" do
      it "rejects notifications with unknown bot secrets" do
        expect {
          post :create, params: {notifications_secret: 'unknown-bot-notifications-secret'}, body:policy_enforcement_block_notification
        }.not_to change(Notification, :count)
        expect(response).not_to be_success
      end

      it "rejects notifications without types" do
        expect {
          post :create, params: {notifications_secret: bot.notifications_secret}
        }.not_to change(Notification, :count)
        expect(response).not_to be_success
      end
    end
  end
end
