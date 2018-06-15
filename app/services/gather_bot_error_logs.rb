class GatherBotErrorLogs
  def self.run(bot, period = 'today')
    period ||= 'today'
    fail "Bot is not yet published" unless bot.published?
    fail "Period is invalid" unless %w(today this_week this_month).include?(period)

    Backend.error_logs(bot.uuid, period: period)
  end
end
