require 'rails_helper'

RSpec.describe Api::CollaboratorsController, type: :controller do
  let!(:user) { create(:user) }
  let!(:bot) { create(:bot, owner: user) }
  let!(:collaborator) { create(:collaborator, bot: bot) }
  let!(:invitation) { create(:invitation, bot: bot) }

  before(:each) { sign_in user }

  describe "index" do
    it "returns the collaborators" do
      get :index, params: { bot_id: bot.id }
      expect(response).to be_success
      expect(json_body['collaborators']).to all(be_a_collaborator_as_json)
      expect(json_pluck(json_body['collaborators'], :id)).to include(collaborator.id)
    end

    it "returns the pending invitations" do
      get :index, params: { bot_id: bot.id }
      expect(response).to be_success
      expect(json_body['invitations']).to all(be_a_invitation_as_json)
      expect(json_pluck(json_body['invitations'], :id)).to include(invitation.id)
      expect(json_pluck(json_body['invitations'], :email)).to_not include(nil)
    end

    it "creates and returns an anonymous invitation" do
      get :index, params: { bot_id: bot.id }
      expect(response).to be_success
      anonymous = json_body['anonymous_invitation']
      expect(anonymous).to_not be_nil
      expect(anonymous).to be_a_invitation_as_json
      expect(anonymous['email']).to be_nil
    end

    it "reuses an existing anonymous invitation" do
      anonymous_invitation = create(:invitation, :anonymous, bot: bot)
      get :index, params: { bot_id: bot.id }
      anonymous = json_body['anonymous_invitation']
      expect(anonymous['id']).to eq(anonymous_invitation.id)
    end

    it "is allowed on shared bots" do
      shared_bot = create(:bot, shared_with: user)

      get :index, params: { bot_id: shared_bot.id }
      expect(response).to be_success
      expect(json_body.keys).to include('collaborators', 'invitations', 'anonymous_invitation')
    end
  end

  describe "destroy" do
    it "removes a collaborator" do
      expect do
        delete :destroy, params: { id: collaborator.id }
      end.to change(bot.collaborators, :count).by(-1)
    end

    it "is allowed on shared bots" do
      shared_bot = create(:bot, shared_with: user)
      other_user = create(:user)
      other_collaborator = shared_bot.collaborators.add_collaborator! other_user

      expect do
        delete :destroy, params: { id: other_collaborator.id }
      end.to change(shared_bot.collaborators, :count).by(-1)
    end
  end

  describe "update" do
    it "updates a collaborator roles" do
      put :update, params: { id: collaborator.id, collaborator: { roles: ['content', 'variables'] }}
      expect(response).to be_success
      expect(json_body).to be_a_collaborator_as_json

      collaborator.reload

      expect(collaborator.roles).to match_array(%w(content variables))
    end
  end
end
