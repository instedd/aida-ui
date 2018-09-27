class GenerateWebChannelAccessTokenWhenMissing < ActiveRecord::Migration[5.1]
  class Channel < ActiveRecord::Base
  end

  def up
    Channel.reset_column_information
    Channel.transaction do
      Channel.where(kind: 'websocket').find_each do |channel|
        channel.config['access_token'] = SecureRandom.uuid unless channel.config['access_token'].present?
        channel.save!
      end
    end
  end
end
