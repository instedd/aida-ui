class CreateInvitations < ActiveRecord::Migration[5.1]
  def change
    create_table :invitations do |t|
      t.references :bot, foreign_key: true
      t.references :creator, foreign_key: { to_table: :users }
      t.string :email, null: true
      t.string :role, null: false
      t.string :token, null: false

      t.timestamps
    end

    add_index :invitations, :token, unique: true
    add_index :invitations, [:bot_id, :email], unique: true
  end
end
