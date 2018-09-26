class Api::ChannelsController < ApplicationApiController
  after_action :verify_authorized

  def index
    bot = Bot.find(params[:bot_id])
    authorize bot, :read_channels?
    channels = policy_scope(bot.channels)

    render json: channels.map { |c| channel_api_json(c) }
  end

  def create
    bot = Bot.find(params[:bot_id])
    authorize bot, :read_channels?

    if (params['channel'])
      channel =
        case params['channel']['kind']
        when 'facebook'
          bot.channels.create! kind: "facebook", name: "Facebook", config: {
            "page_id" => "", "verify_token" => SecureRandom.base58, "access_token" => ""
          }
        when 'websocket'
          bot.channels.create! kind: "websocket", name: "Web", config: {
            "access_token" => SecureRandom.uuid
          }
        when nil
          render json: { error: 'missing channel kind' }, status: 422 and return
        else
          render json: { error: 'unknown channel kind' }, status: 422 and return
        end

      render json: channel_api_json(channel)
    else
      render json: { error: 'missing channel' }, status: 422
    end
  end

  def destroy
    channel = Channel.find(params[:id])
    authorize channel
    channel.destroy
    head :no_content
  end

  def update
    channel = Channel.find(params[:id])
    authorize channel
    channel.update_attributes!(permitted_attributes(channel))
    render json: channel_api_json(channel)
  end

  private

  def channel_api_json(channel)
    {
      id: channel.id,
      name: channel.name,
      kind: channel.kind,
      config: channel.config
    }
  end
end
