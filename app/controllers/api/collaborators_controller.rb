class Api::CollaboratorsController < ApplicationApiController
  include InvitationHelper
  after_action :verify_authorized

  def index
    bot = Bot.find(params[:bot_id])
    authorize bot, :read_collaborators?

    collaborators = policy_scope(bot.collaborators.includes(:user))
    invitations = policy_scope(bot.invitations).non_anonymous
    anonymous_invitation = bot.invitations.anonymous || bot.invitations.create_anonymous!('collaborator')

    render json: { collaborators: collaborators.map { |c| collaborator_api_json(c) },
                   invitations: invitations.map { |i| invitation_api_json(i) },
                   anonymous_invitation: invitation_api_json(anonymous_invitation)
                 }
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
      role: collaborator.role,
      user_email: collaborator.user.email,
      last_activity: (collaborator.user.last_sign_at.to_s(:iso8601) rescue nil)
    }
  end
end
