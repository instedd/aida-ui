require 'rails_helper'

RSpec.describe Api::CollaboratorsController, type: :controller do
  let!(:user) { create(:user) }
  let!(:bot) { create(:bot, owner: user) }
  let!(:collaborator) { create(:collaborator, bot: bot) }
  let!(:invitation) { create(:invitation, bot: bot) }
  let!(:anonymous_invitation) { create(:invitation, :anonymous, bot: bot)}

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
      expect(json_pluck(json_body['invitations'], :id)).to include(invitation.id, anonymous_invitation.id)
      expect(json_pluck(json_body['invitations'], :email)).to include(invitation.email)
    end

    it "is denied on shared bots" do
      shared_bot = create(:bot, shared_with: user, grants: %w(publish))

      get :index, params: { bot_id: shared_bot.id }
      expect(response).to be_denied
    end
  end

  describe "destroy" do
    it "removes a collaborator" do
      expect do
        delete :destroy, params: { id: collaborator.id }
      end.to change(bot.collaborators, :count).by(-1)
    end

    it "is denied on shared bots" do
      shared_bot = create(:bot, shared_with: user, grants: %w(publish))
      other_user = create(:user)
      other_collaborator = shared_bot.collaborators.add_collaborator! other_user, roles: %w(content)

      expect do
        delete :destroy, params: { id: other_collaborator.id }
      end.not_to change(shared_bot.collaborators, :count)
      expect(response).to be_denied
    end

    it "is allowed if the collaborator is the user" do
      # ie. abandon collaboration
      shared_bot = create(:bot)
      collaborator = shared_bot.collaborators.add_collaborator!(user)

      expect do
        delete :destroy, params: { id: collaborator.id }
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

    it "is denied on shared bots" do
      shared_bot = create(:bot, shared_with: user, grants: %w(publish))
      other_collaborator = shared_bot.collaborators.add_collaborator! create(:user), roles: %w(content)

      put :update, params: { id: other_collaborator.id, collaborator: { roles: ['content', 'variables'] }}
      expect(response).to be_denied
    end
  end
end
