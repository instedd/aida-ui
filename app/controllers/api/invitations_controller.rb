class Api::InvitationsController < ApplicationApiController
  include InvitationHelper
  after_action :verify_authorized

  def create
    bot = Bot.find(params[:bot_id])
    authorize bot, :invite_collaborator?
    invitation = if params[:email].present?
                   InviteCollaborator.run(bot, params[:email], params[:roles], current_user)
                 elsif params[:token].present?
                   bot.invitations.create_anonymous!(params[:token], params[:roles], current_user)
                 end
    if invitation.nil?
      render json: { error: "Must provide either an email or a token" },
             status: :bad_request
    elsif invitation.valid?
      render json: invitation_api_json(invitation)
    else
      error_message = invitation.errors.full_messages.join(', ')
      render json: { error: "Failed to invite collaborator: #{error_message}" },
             status: :bad_request
    end
  end

  def resend
    invitation = Invitation.find(params[:id])
    authorize invitation
    ResendInvitation.run(invitation)
    render json: invitation_api_json(invitation)
  end

  def destroy
    invitation = Invitation.find(params[:id])
    authorize invitation
    invitation.destroy
    head :ok
  end

  def retrieve
    invitation = Invitation.find_by!(token: params[:token])
    authorize invitation
    render json: { bot_name: invitation.bot.name,
                   inviter: invitation.creator.email,
                   roles: invitation.roles }
  rescue Pundit::NotAuthorizedError => e
    # render as 404 to avoid leaking security information
    render_not_found_response(e)
  end

  def accept
    invitation = Invitation.find_by!(token: params[:token])
    authorize invitation
    collaborator = AcceptInvitation.run(invitation, current_user)
    render json: { bot_id: collaborator.bot.id }
  rescue Pundit::NotAuthorizedError => e
    # render as 404 to avoid leaking security information
    render_not_found_response(e)
  end
end
