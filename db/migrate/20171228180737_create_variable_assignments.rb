class CreateVariableAssignments < ActiveRecord::Migration[5.1]
  def change
    create_table :variable_assignments do |t|
      t.references :bot, foreign_key: true

      t.string :variable_id, null: false
      t.string :variable_name

      t.string :condition_id, null: true
      t.string :condition, limit: 1024
      t.integer :condition_order

      t.string :value, limit: 1024
      t.string :lang

      t.timestamps
    end
  end
end
