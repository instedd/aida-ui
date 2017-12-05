class PublishBot
  def self.run(bot)
    if bot.published?
      Backend.update_bot(bot.uuid, bot.manifest)
    else
      uuid = Backend.create_bot(bot.manifest)
      bot.uuid = uuid
      bot.save!
    end
    bot.uuid

  rescue BackendError => e
    puts "Failed to publish bot: #{e}"
    e.errors.each do |error|
      puts " - #{error}"
    end
    nil
  end
end
