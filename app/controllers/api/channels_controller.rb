class Api::ChannelsController < ApplicationApiController
  after_action :verify_authorized

  def index
    bot = Bot.find(params[:bot_id])
    authorize bot, :read_channels?
    channels = policy_scope(bot.channels)

    render json: channels.map { |c| channel_api_json(c) }
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
