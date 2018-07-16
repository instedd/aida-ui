require 'rails_helper'

RSpec.describe Api::NotificationsController, type: :controller do
  let!(:user) { create(:user) }
  let!(:bot) { create(:bot, owner: user) }

  let(:policy_enforcement_block_notification) {
    {
      type: "policy_enforcement",
      data: {
        "action": "block",
        "reason": "The bot violated our Platform Policies (https://developers.facebook.com/policy/#messengerplatform). Common violations include sending out excessive spammy messages or being non-functional."
      }
    }
  }

  describe "POST #create" do
    context "with valid params" do
      it "creates a new Notification by bot secret" do
        expect {
          post :create, params: {notifications_secret: bot.notifications_secret, notification: policy_enforcement_block_notification}
        }.to change(Notification, :count).by(1)
        expect(response).to be_success
        expect(Notification.last.notification_type).to eq("policy_enforcement")
        expect(Notification.last.data.keys).to match_array(["reason", "action"])
        expect(Notification.last.data['action']).to eq("block")
      end

      it "creates a new Notification with an unknown type" do
        expect {
          post :create, params: {notifications_secret: bot.notifications_secret, notification: { type: 'an-unknown-type', data: {}}}
        }.to change(Notification, :count).by(1)
        expect(response).to be_success
        expect(Notification.last.notification_type).to eq('an-unknown-type')
        expect(Notification.last.data).to be_empty
      end

      it "rejects notifications with unknown bot secrets" do
        expect {
          post :create, params: {notifications_secret: 'unknown-bot-notifications-secret', notification: policy_enforcement_block_notification}
        }.not_to change(Notification, :count)
        expect(response).not_to be_success
      end

      it "rejects notifications without types" do
        expect {
          post :create, params: {notifications_secret: bot.notifications_secret, notification: {}}
        }.not_to change(Notification, :count)
        expect(response).not_to be_success
      end
    end
  end
end
