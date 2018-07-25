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

  describe "POST #create" do
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
