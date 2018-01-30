class AddKeypairToUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :public_key, :string
    add_column :users, :encrypted_secret_key, :string
  end
end
