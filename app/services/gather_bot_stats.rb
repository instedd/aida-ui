class GatherBotStats
  def self.run(bot, period = 'today')
    period ||= 'today'
    fail "Bot is not yet published" unless bot.published?
    fail "Period is invalid" unless %w(today this_week this_month).include?(period)

    summary = Backend.usage_summary(bot.uuid)
    users_per_skill = Backend.users_per_skill(bot.uuid)

    {
      active_users: summary['active_users'],
      messages_sent: summary['messages_sent'],
      messages_received: summary['messages_received'],
      behaviours: bot.behaviours.map do |behaviour|
        users = users_per_skill.detect { |ups| ups['skill_id'] == behaviour.id }
        user_count = users['count'] rescue 0
        {
          id: behaviour.id,
          label: behaviour.name,
          kind: behaviour.kind,
          users: user_count
        }
      end
    }
  end
end
