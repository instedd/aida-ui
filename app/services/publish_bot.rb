class PublishBot
  def self.run(bot)
    if bot.published?
      Backend.update_bot(bot.uuid, bot.manifest)
    else
      uuid = Backend.create_bot(bot.manifest)
      bot.uuid = uuid
      bot.save!
    end
    {status: :ok, bot: bot.uuid}

  rescue BackendError => e
    puts "Failed to publish bot: #{e}"
    e.errors.each do |error|
      puts " - #{error}"
    end
    {status: :error, errors: BackendError.parse_errors(e.errors)}
  end

  def self.preview(bot, access_token)
    if bot.preview_uuid.present?
      Backend.update_bot(bot.preview_uuid, bot.preview_manifest(access_token))
    else
      bot.preview_uuid = Backend.create_bot(bot.preview_manifest(access_token), temp: true)
      bot.save!
    end

    bot.preview_uuid

  rescue BackendError => e
    puts "Failed to preview bot: #{e}"
    e.errors.each do |error|
      puts " - #{error}"
    end
    {status: :error, errors: BackendError.parse_errors(e.errors)}
  end
end
