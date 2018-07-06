class AddUnsubscribeToFrontDesk < ActiveRecord::Migration[5.1]
  def up
    Bot.all.each do |bot|
      bot.behaviours.where(kind: "front_desk").each do |front_desk|
        front_desk.config["unsubscribe_introduction_message"] = "Send UNSUBSCRIBE to stop receiving messages"
        front_desk.config["unsubscribe_keywords"] = "UNSUBSCRIBE"
        front_desk.config["unsubscribe_acknowledge_message"] = "I won't send you any further messages"
        front_desk.save!
      end
    end
  end

  def down
    Bot.all.each do |bot|
      bot.behaviours.where(kind: "front_desk").each do |front_desk|
        front_desk.config.except!("unsubscribe_introduction_message", "unsubscribe_keywords", "unsubscribe_acknowledge_message")
        front_desk.save!
      end
    end
  end
end
