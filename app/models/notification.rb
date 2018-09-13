class Notification < ApplicationRecord
  belongs_to :bot
  alias_attribute :type, :notification_type
  after_initialize :init

  def init
    self.uuid ||= SecureRandom.uuid
  end

  def bot_forwarding_messages!(value)
    raise 'bot_forwarding_messages only supported for a human_override notification' if notification_type != 'human_override'

    data['bot_forwarding_messages'] = value
  end

  def bot_forwarding_messages?
    data['bot_forwarding_messages'] || false
  end

  def messages
    data['messages'] || []
  end

  def add_message!(message)
    raise 'messages only supported for a human_override notification' if notification_type != 'human_override'
    raise "invalid message" unless JSON::Validator.validate(schema_file, message, fragment: message_schema_fragment)
    data['messages'] = messages.push(message)
  end

  private

  def schema_file
    Rails.root.join("app", "schemas", "types.json").read
  end

  def message_schema_fragment
    "#/definitions/directional_message"
  end

end
