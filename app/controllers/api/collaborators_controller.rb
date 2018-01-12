class Api::CollaboratorsController < ApplicationApiController
  include InvitationHelper
  after_action :verify_authorized

  def index
    bot = Bot.find(params[:bot_id])
    authorize bot, :read_collaborators?

    collaborators = policy_scope(bot.collaborators.includes(:user))
    invitations = policy_scope(bot.invitations)

    render json: { collaborators: collaborators.map { |c| collaborator_api_json(c) },
                   invitations: invitations.map { |i| invitation_api_json(i) }
                 }
  end

  def update
    collaborator = Collaborator.find(params[:id])
    authorize collaborator
    collaborator.update_attributes!(permitted_attributes(collaborator))
    render json: collaborator_api_json(collaborator)
  end

  def destroy
    collaborator = Collaborator.find(params[:id])
    authorize collaborator
    collaborator.destroy
    head :ok
  end

  private

  def collaborator_api_json(collaborator)
    {
      id: collaborator.id,
      roles: collaborator.roles,
      user_email: collaborator.user.email,
      last_activity: (collaborator.user.updated_at.to_s(:iso8601) rescue nil)
    }
  end
end
