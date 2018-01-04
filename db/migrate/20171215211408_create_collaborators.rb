class CreateCollaborators < ActiveRecord::Migration[5.1]
  def change
    create_table :collaborators do |t|
      t.references :bot, foreign_key: true
      t.references :user, foreign_key: true
      t.string :role, nullable: false

      t.timestamps
    end

    add_index :collaborators, [:bot_id, :user_id], unique: true
  end
end
