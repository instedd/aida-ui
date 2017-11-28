class CreateBehaviours < ActiveRecord::Migration[5.1]
  def change
    create_table :behaviours do |t|
      t.references :bot, foreign_key: true
      t.string :name
      t.string :kind
      t.json :config
      t.boolean :enabled, default: true
      t.integer :order

      t.timestamps
    end
  end
end
