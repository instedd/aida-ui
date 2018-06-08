class AddPreviewUuidToBots < ActiveRecord::Migration[5.1]
  def change
    add_column :bots, :preview_uuid, :string
  end
end
