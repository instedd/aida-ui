class GenerateWebChannelUrlKey < ActiveRecord::Migration[5.1]
  class Channel < ActiveRecord::Base
    belongs_to :bot
  end
  class Bot < ActiveRecord::Base
    has_many :channels
  end

  def up
    Bot.reset_column_information
    Channel.reset_column_information

    Bot.where.not(uuid: nil).find_each do |bot|
      Channel.transaction do
        bot.channels.where(kind: 'websocket').find_each do |channel|
          channel.config['url_key'] = Shortener::ShortenedUrl.generate("/c/#{bot.uuid}/#{channel.config['access_token']}").unique_key
          channel.save!
        end
      end
    end
  end

  def down
    Channel.reset_column_information
    Channel.transaction do
      Channel.where(kind: 'websocket').find_each do |channel|
        Shortener::ShortenedUrl.where(unique_key: channel.config['url_key']).destroy_all
        channel.config.delete('url_key')
        channel.save!
      end
    end
  end
end
