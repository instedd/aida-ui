class Api::BotsController < ApplicationController
  def index
    Bot.create_prepared! if current_user_bots.count == 0

    render json: current_user_bots.map { |b| bot_api_json(b) }
  end

  def create
    render json: bot_api_json(Bot.create_prepared!)
  end

  def update
    bot = current_user_bots.find(params[:id])
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

  def current_user_bots
    Bot.all
  end
end
