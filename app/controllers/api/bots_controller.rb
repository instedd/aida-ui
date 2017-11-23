class Api::BotsController < ApplicationApiController
  def index
    Bot.create_prepared!(current_user) if current_user.bots.count == 0

    render json: current_user.bots.map { |b| bot_api_json(b) }
  end

  def create
    render json: bot_api_json(Bot.create_prepared!(current_user))
  end

  def update
    bot = current_user.bots.find(params[:id])
    bot_params = params.require(:bot).permit(:name)
    bot.update_attributes!(bot_params)
    render json: bot_api_json(bot)
  end

  private

  def bot_api_json(bot)
    {
      id: bot.id,
      name: bot.name
    }
  end
end