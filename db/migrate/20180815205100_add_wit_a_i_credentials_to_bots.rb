class AddWitAICredentialsToBots < ActiveRecord::Migration[5.1]
  def change
    add_column :bots, :wit_ai_auth_token, :string
  end
end
