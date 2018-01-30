class CreateDataTables < ActiveRecord::Migration[5.1]
  def change
    create_table :data_tables do |t|
      t.references :bot, foreign_key: true

      t.string :name, null: false
      t.json :data

      t.timestamps
    end
  end
end
