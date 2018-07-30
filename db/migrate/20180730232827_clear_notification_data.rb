class ClearNotificationData < ActiveRecord::Migration[5.1]
  def up
    execute %(DELETE FROM notifications)
  end

  def down
    execute %(DELETE FROM notifications)
  end
end
