class Bot < ApplicationRecord
  belongs_to :owner, class_name: "User"
  has_many :channels

  def self.create_prepared!(user)
    bot = Bot.create! owner: user
    bot.name = "Bot #{bot.id}"
    bot.save!

    bot.channels.create! kind: "facebook", name: "facebook", config: {
      "page_id" => "", "verify_token" => "", "access_token" => ""
    }

    bot
  end
end
