class AddUnsubscribeToFrontDesk < ActiveRecord::Migration[5.1]
  def up
    Bot.all.each do |bot|
      bot.behaviours.where(kind: "front_desk").each do |front_desk|
        begin
          front_desk.config["unsubscribe_introduction_message"] = "Send UNSUBSCRIBE to stop receiving messages"
          front_desk.config["unsubscribe_keywords"] = "UNSUBSCRIBE"
          front_desk.config["unsubscribe_acknowledge_message"] = "I won't send you any further messages"
          if front_desk.config["threshold"] > 0.5
            front_desk.config["threshold"] = 0.5
          end
          front_desk.save!
        rescue => e
          puts e.message
          puts bot.id
          puts front_desk.config
        end
      end
    end
  end

  def down
    Bot.all.each do |bot|
      bot.behaviours.where(kind: "front_desk").each do |front_desk|
        begin
          front_desk.config.except!("unsubscribe_introduction_message", "unsubscribe_keywords", "unsubscribe_acknowledge_message")
          front_desk.save!
        rescue => e
          puts e.message
        end
      end
    end
  end
end
