class AddSessionUuidToNotifications < ActiveRecord::Migration[5.1]
  def change
    add_column :notifications, :session_uuid, :string
  end
end
