class HumanOverrideChannel < ApplicationCable::Channel
  def subscribed
    stream_from "human_override_channel_#{params[:room]}"
  end
end
