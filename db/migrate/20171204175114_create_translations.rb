class CreateTranslations < ActiveRecord::Migration[5.1]
  def change
    create_table :translations do |t|
      t.references :behaviour, foreign_key: true
      t.string :key, null: false
      t.string :lang, null: false
      t.string :value, limit: 1024

      t.timestamps
    end

    add_index :translations, [:behaviour_id, :key, :lang], unique: true
  end
end
