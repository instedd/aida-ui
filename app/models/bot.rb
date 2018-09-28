class Bot < ApplicationRecord
  belongs_to :owner, class_name: "User"
  has_many :channels, dependent: :destroy
  has_many :behaviours, dependent: :destroy
  has_many :translations, through: :behaviours
  has_many :variable_assignments, dependent: :destroy
  has_many :data_tables, dependent: :destroy
  has_many :collaborators, dependent: :destroy
  has_many :invitations, dependent: :destroy
  has_many :collaborating_users, through: :collaborators, source: :user
  has_many :sessions, dependent: :destroy
  has_many :users, through: :sessions
  has_many :notifications, dependent: :destroy

  validate :has_single_front_desk

  def self.create_prepared!(user)
    bot = Bot.new owner: user
    bot.save(validate: false)

    bot.name = "Bot #{bot.id}"

    bot.behaviours.create_front_desk!

    bot.generate_notifications_secret!

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
      notifications_url: notifications_url,
      front_desk: front_desk.manifest_fragment,
      skills: skills.enabled.map do |skill|
        skill.manifest_fragment
      end,
      variables: VariableAssignment.manifest(self.variable_assignments, self.default_language, self.other_languages),
      channels: channels.order(:id).map do |channel|
        channel.config.except('url_key').merge(type: channel.kind)
      end
    }.tap do |manifest|
      manifest[:data_tables] = data_tables.map do |table|
        table.manifest_fragment
      end if data_tables.present?
      manifest[:public_keys] = public_keys_fragment if public_keys_fragment.present?
      manifest[:natural_language_interface] =
      {
        provider: "wit_ai",
        auth_token: self.wit_ai_auth_token
      } if self.wit_ai_auth_token and self.skills.any? { |skill| skill["enabled"] and skill["config"]["use_wit_ai"] }
    end
  end

  def preview_manifest(access_token)
    manifest.tap do |m|
      m[:channels] = [{type: "websocket", access_token: access_token}]
    end
  end

  def front_desk
    behaviours.find_by(kind: "front_desk")
  end

  def skills
    behaviours.where.not(kind: "front_desk").order(:order)
  end

  def language_detector
    behaviours.enabled.where(kind: "language_detector").first
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

  def public_keys_fragment
    if owner.public_key.present?
      [owner.public_key]
    else
      []
    end
  end

  def get_session(user)
    self.sessions.where(user: user).take
  end

  def generate_notifications_secret!
    self.notifications_secret = SecureRandom.hex(40)
  end

  def notifications_url
    URI::join(Settings.base_url, "notifications/#{notifications_secret}")
  end

  def add_default_channels!
    self.channels.create! kind: "facebook", name: "Facebook", config: {
      "page_id" => "", "verify_token" => SecureRandom.base58, "access_token" => ""
    }
    self.channels.create! kind: "websocket", name: "Web", config: {
      "access_token" => SecureRandom.uuid,
      "url_key" => ""
    }
    self
  end

  private

  def has_single_front_desk
    if behaviours.where(kind: "front_desk").count != 1
      errors[:base] << "Must have a single front desk behaviour"
    end
  end
end
