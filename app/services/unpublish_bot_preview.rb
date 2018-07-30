class UnpublishBotPreview
  def self.run(bot)
    if bot.preview_uuid.present?
      Backend.destroy_bot(bot.preview_uuid)
      bot.preview_uuid = nil
      bot.save!
    end

  rescue BackendError => e
    puts "Failed to unpublish bot: #{e}"
    e.errors.each do |error|
      puts " - #{error}"
    end
    nil
  end
end
