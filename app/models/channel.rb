class Channel < ApplicationRecord
  belongs_to :bot

  validates :name, presence: true
  validates :kind, inclusion: { in: %w(facebook websocket) }

  validate :config_must_match_schema

  scope :of_bots_owned_by, -> (user) { Channel.where(bot: user.bots) }

  def setup?
    if self.kind == "facebook"
      config["page_id"].present? &&
      config["verify_token"].present? &&
      config["access_token"].present?
    else
      config["access_token"].present?
    end
  end

  def self.setup_or_facebook(channel_list)
    if channel_list.select{ |c| c.setup? }.length > 0
      channel_list.select{ |c| c.setup? }
    else
      channel_list.select{ |c| c.kind == "facebook" }
    end
  end

  private

  def config_must_match_schema
    unless JSON::Validator.validate(schema_file, config, fragment: config_schema_fragment)
      errors.add(:config, "does not match schema")
    end
  end

  def schema_file
    Rails.root.join("app", "schemas", "types.json").read
  end

  def config_schema_fragment
    case kind
    when "facebook"
      "#/definitions/facebookChannelConfig"
    when "websocket"
      "#/definitions/websocketChannelConfig"
    else
      fail "config schema not defined"
    end
  end
end
