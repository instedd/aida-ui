class AddNotificationsSecretToBots < ActiveRecord::Migration[5.1]
  def change
    add_column :bots, :notifications_secret, :string
    Bot.reset_column_information
    Bot.all.each do |bot|
      bot.update_attributes!(notifications_secret: SecureRandom.hex(40))
    end
  end
end
