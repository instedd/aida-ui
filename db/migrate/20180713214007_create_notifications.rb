class CreateNotifications < ActiveRecord::Migration[5.1]
  def change
    create_table :notifications do |t|
      t.references :bot, foreign_key: true
      t.string :notification_type
      t.json :data

      t.timestamps
    end
  end
end
