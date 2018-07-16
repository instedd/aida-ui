class Notification < ApplicationRecord
  belongs_to :bot
  alias_attribute :type, :notification_type
end
