class CreateChannels < ActiveRecord::Migration[5.1]
  def change
    create_table :channels do |t|
      t.references :bot, foreign_key: true
      t.string :name
      t.string :kind
      t.json :config

      t.timestamps
    end
  end
end
