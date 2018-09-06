class Notification < ApplicationRecord
  belongs_to :bot
  alias_attribute :type, :notification_type
  after_initialize :init

  def init
    self.uuid ||= SecureRandom.uuid
  end

  def messages
    data['messages'] || []
  end

  def add_message!(message)
    raise 'messages only supported for a human_override notification' if notification_type != 'human_override'
    data['messages'] = messages.push(message)
  end
end
