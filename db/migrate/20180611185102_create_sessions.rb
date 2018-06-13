class CreateSessions < ActiveRecord::Migration[5.1]
  def change
    create_table :sessions do |t|
      t.references :user, foreign_key: true
      t.references :bot, foreign_key: true
      t.string :session_uuid

      t.timestamps
    end

    add_index :sessions, [:bot_id, :user_id], unique: true
  end
end
