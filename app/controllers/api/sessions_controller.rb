class Api::SessionsController < ApplicationApiController
  before_action :load_bot

  def index
    authorize @bot, :read_session_data?

    result = Backend.sessions(@bot.uuid)
    render json: { data: result }
  end

  def log
    authorize @bot, :read_session_data?

    result = Backend.sessions_log(@bot.uuid, params[:id])
    render json: { data: result }
  end

  def send_message
    authorize @bot, :read_session_data?

    result = Backend.sessions_send_data(@bot.uuid, params[:id], request.request_parameters)
    render json: { data: result }
  end

  private

  def load_bot
    @bot = Bot.find(params[:bot_id])
  end
end
