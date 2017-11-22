class Bot < ApplicationRecord
  has_many :channels

  def self.create_prepared!
    bot = Bot.create!
    bot.name = "Bot #{bot.id}"
    bot.save!

    bot.channels.create! kind: "facebook", name: "facebook", config: {
      "page_id" => "", "verify_token" => "", "access_token" => ""
    }

    bot
  end
end
