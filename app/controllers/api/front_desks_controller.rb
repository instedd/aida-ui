class Api::FrontDesksController < ApplicationApiController
  after_action :verify_authorized

  def show
    bot = Bot.find(params[:bot_id])
    authorize bot, :read_behaviours?
    front_desk = bot.front_desk

    render json: front_desk_api_json(front_desk)
  end

  def update
    front_desk = Bot.find(params[:bot_id]).front_desk
    authorize front_desk

    front_desk_params = params.require(:front_desk).permit(policy(front_desk).permitted_attributes)
    front_desk.update_attributes!(front_desk_params)
    render json: front_desk_api_json(front_desk)
  end

  private

  def front_desk_api_json(front_desk)
    {
      id: front_desk.id,
      config: front_desk.config
    }
  end
end
