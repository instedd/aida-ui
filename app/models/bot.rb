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

  def published?
    uuid.present?
  end

  def manifest
    {
      version: 1,
      languages: ['en'],
      front_desk: {
        greeting: {message:{en: ''}},
        introduction: {message:{en: ''}},
        not_understood: {message:{en: ''}},
        clarification: {message:{en: ''}},
        threshold: 0.5
      },
      skills: [
        {
          type: :language_detector,
          explanation: 'Choose your language',
          languages: {en: ['english']}
        }
      ],
      variables: [],
      channels: channels.map do |channel|
        channel.config.merge(type: channel.kind)
      end
    }
  end
end
