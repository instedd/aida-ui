class Bot < ApplicationRecord
  belongs_to :owner, class_name: "User"
  has_many :channels, dependent: :destroy
  has_many :behaviours, dependent: :destroy
  has_many :translations, through: :behaviours
  has_many :variable_assignments, dependent: :destroy
  has_many :collaborators, dependent: :destroy

  validate :has_single_front_desk

  def self.create_prepared!(user)
    bot = Bot.new owner: user
    bot.save(validate: false)

    bot.name = "Bot #{bot.id}"

    bot.channels.create! kind: "facebook", name: "facebook", config: {
      "page_id" => "", "verify_token" => "", "access_token" => ""
    }

    bot.behaviours.create_front_desk!

    bot.save!
    bot
  end

  def published?
    uuid.present?
  end

  def manifest
    {
      version: "1",
      languages: available_languages,
      front_desk: front_desk.manifest_fragment,
      skills: skills.enabled.map do |skill|
        skill.manifest_fragment
      end,
      variables: [],
      channels: channels.map do |channel|
        channel.config.merge(type: channel.kind)
      end
    }
  end

  def preview_manifest(access_token)
    {
      version: "1",
      languages: available_languages,
      front_desk: front_desk.manifest_fragment,
      skills: skills.enabled.map do |skill|
        skill.manifest_fragment
      end,
      variables: [],
      channels: [{type: "websocket", access_token: access_token}]
    }
  end

  def front_desk
    behaviours.find_by(kind: "front_desk")
  end

  def skills
    behaviours.where.not(kind: "front_desk").order(:order)
  end

  def language_detector
    behaviours.where(kind: "language_detector").first
  end

  def available_languages
    if detector = language_detector
      detector.config["languages"].map do |lang|
        lang["code"]
      end
    else
      ['en']
    end
  end

  def default_language
    available_languages.first
  end

  def other_languages
    available_languages.drop(1)
  end

  def translation_keys
    behaviours.map do |behaviour|
      keys = behaviour.translation_keys
      if keys.present?
        {
          id: behaviour.id,
          label: behaviour.name,
          keys: keys
        }
      end
    end.compact
  end

  private

  def has_single_front_desk
    if behaviours.where(kind: "front_desk").count != 1
      errors[:base] << "Must have a single front desk behaviour"
    end
  end
end
