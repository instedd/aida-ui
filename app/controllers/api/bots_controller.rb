class Api::BotsController < ApplicationController
  def index
    current_user_create_bot if current_user_bots.count == 0

    render json: current_user_bots.map { |b| bot_api_json(b) }
  end

  def create
    render json: bot_api_json(current_user_create_bot)
  end

  private

  def bot_api_json(bot)
    {
      id: bot.id,
      name: bot.name
    }
  end

  def current_user_create_bot
    bot = Bot.create!
    bot.name = "Bot #{bot.id}"
    bot.save!

    bot
  end

  def current_user_bots
    Bot.all
  end
end
