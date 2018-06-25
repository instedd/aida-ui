class CreateAWebsocketChannelForExistingBots < ActiveRecord::Migration[5.1]
  def up
    Bot.all.each do |bot|
      if(bot.channels.length == 1)
        bot.channels.create! kind: "websocket", name: "websocket", config: {
          "access_token" => ""
        }
      end
    end
  end

  def down
    Bot.all.each do |bot|
      bot.channels.where(kind: "websocket").destroy
    end
  end
end
