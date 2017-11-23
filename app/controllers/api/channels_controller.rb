class Api::ChannelsController < ApplicationApiController
  def index
    channels = current_user.bots.find(params[:bot_id]).channels

    render json: channels.map { |c| channel_api_json(c) }
  end

  def update
    channel = Channel.of_bots_owned_by(current_user).find(params[:id])
    channel_params = params.require(:channel).permit(:name, config: {})
    channel.update_attributes!(channel_params)
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
