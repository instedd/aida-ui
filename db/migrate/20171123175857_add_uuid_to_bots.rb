class AddUuidToBots < ActiveRecord::Migration[5.1]
  def change
    add_column :bots, :uuid, :string
  end
end
