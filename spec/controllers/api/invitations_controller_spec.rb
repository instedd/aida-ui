require 'rails_helper'

RSpec.describe Api::InvitationsController, type: :controller do
  let!(:user) { create(:user) }
  let!(:bot) { create(:bot, owner: user) }

  before(:each) {
    sign_in user
    clear_mail_deliveries
  }

  describe "create" do
    it "creates a new invitation and sends an email" do
      email = generate(:email)
      post :create, params: { bot_id: bot.id, email: email, roles: ['publish'] }

      expect(response).to be_success
      expect(json_body).to be_a_invitation_as_json
      expect(all_mail_deliveries.size).to eq(1)
      expect(all_mail_destinations).to include(email)
    end

    it "is rejected for already invited emails" do
      email = generate(:email)
      create(:invitation, bot: bot, email: email)

      post :create, params: { bot_id: bot.id, email: email, roles: ['publish'] }

      expect(response.status).to eq(400)
    end

    it "is allowed on shared bots" do
      shared_bot = create(:bot, shared_with: user)
      post :create, params: { bot_id: shared_bot.id,
                              email: generate(:email),
                              roles: ['publish'] }

      expect(response).to be_success
      expect(json_body).to be_a_invitation_as_json
    end
  end

  describe "resend" do
    let!(:email) { generate(:email) }
    let!(:invitation) { create(:invitation, bot: bot, email: email) }

    it "resends the invitation email" do
      post :resend, params: { id: invitation.id }

      expect(response).to be_success
      expect(all_mail_deliveries.size).to eq(1)
      expect(all_mail_destinations).to include(email)
    end

    it "is allowed on shared bots" do
      shared_bot = create(:bot, shared_with: user)
      invitation = create(:invitation, bot: shared_bot, email: email)

      post :resend, params: { id: invitation.id }

      expect(response).to be_success
      expect(all_mail_deliveries.size).to eq(1)
      expect(all_mail_destinations).to include(email)
    end
  end

  describe "destroy" do
    let!(:email) { generate(:email) }

    it "removes an existing invitation" do
      invitation = create(:invitation, bot: bot, email: email)
      expect do
        delete :destroy, params: { id: invitation.id }
      end.to change(Invitation, :count).by(-1)
    end

    it "is allowed on shared bots" do
      shared_bot = create(:bot, shared_with: user)
      invitation = create(:invitation, bot: shared_bot, email: email)
      expect do
        delete :destroy, params: { id: invitation.id }
      end.to change(Invitation, :count).by(-1)
    end
  end

  describe "for invitees" do
    let!(:other_bot) { create(:bot) }
    let!(:invitation) { create(:invitation, bot: other_bot, email: user.email) }
    let!(:other_invitation) { create(:invitation, bot: other_bot) }
    let!(:anonymous_invitation) { create(:invitation, :anonymous, bot: other_bot) }

    describe "retrieve" do
      it "returns invitation information" do
        get :retrieve, params: { token: invitation.token }
        expect(response).to be_success
        expect(json_body).to match_attributes({ bot_name: invitation.bot.name,
                                                inviter: invitation.creator.email,
                                                roles: invitation.roles })
      end

      it "validates token" do
        get :retrieve, params: { token: 'invalid-token' }
        expect(response.status).to eq(404)
      end

      it "validates email for non-anonymous invitations" do
        get :retrieve, params: { token: other_invitation.token }
        expect(response.status).to eq(404)
      end

      it "works for anonymous invitations" do
        get :retrieve, params: { token: anonymous_invitation.token }
        expect(response).to be_success
        expect(json_body).to match_attributes({ bot_name: anonymous_invitation.bot.name,
                                                inviter: anonymous_invitation.creator.email,
                                                roles: anonymous_invitation.roles })
      end
    end

    describe "accept" do
      it "validates token" do
        post :accept, params: { token: 'invalid-token' }
        expect(response.status).to eq(404)
      end

      it "validates email identity for directed invitations" do
        post :accept, params: { token: other_invitation.token }
        expect(response.status).to eq(404)
      end

      it "returns the bot information of the invitation" do
        post :accept, params: { token: invitation.token }
        expect(response).to be_success
        expect(json_body).to match_attributes({ bot_id: invitation.bot.id })
      end

      it "creates a new collaborator" do
        expect do
          post :accept, params: { token: invitation.token }
        end.to change(other_bot.collaborators, :count).by(1)

        collaborator = other_bot.reload.collaborators.find_by(user_id: user.id)
        expect(collaborator).to_not be_nil
        expect(collaborator.roles).to eq(invitation.roles)
      end

      it "removes invitation record" do
        expect do
          post :accept, params: { token: invitation.token }
        end.to change(other_bot.invitations, :count).by(-1)

        expect(other_bot.invitations.non_anonymous.pluck(:email)).to_not include(user.email)
      end

      it "works for anonymous invitations" do
        expect do
          post :accept, params: { token: anonymous_invitation.token }
        end.to change(other_bot.collaborators, :count).by(1)

        other_bot.reload
        expect(other_bot.collaborators.emails).to include(user.email)
        expect(other_bot.invitations.anonymous).to be_nil
      end
    end
  end
end
