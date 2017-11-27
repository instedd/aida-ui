class Api::FrontDesksController < ApplicationApiController
  def show
    front_desk = current_user.bots.find(params[:bot_id]).front_desk

    render json: front_desk_api_json(front_desk)
  end

  def update
    front_desk = current_user.bots.find(params[:bot_id]).front_desk
    front_desk_params = params.require(:front_desk).permit(config: {})
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
