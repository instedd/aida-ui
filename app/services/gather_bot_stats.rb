class GatherBotStats
  def self.run(bot, period = 'today')
    period ||= 'today'
    fail "Bot is not yet published" unless bot.published?
    fail "Period is invalid" unless %w(today this_week this_month).include?(period)

    summary = Backend.usage_summary(bot.uuid, period: period)
    users_per_skill = Backend.users_per_skill(bot.uuid, period: period)

    skills = bot.skills.index_by(&:id)
    {
      active_users: summary['active_users'] || 0,
      messages_sent: summary['messages_sent'] || 0,
      messages_received: summary['messages_received'] || 0,
      behaviours: users_per_skill.map do |ups|
        behaviour = skills[ups['skill_id'].to_i]
        if behaviour
          {
            id: behaviour.id,
            label: behaviour.name,
            kind: behaviour.kind,
            users: ups['count']
          }
        elsif ups['skill_id'] == "front_desk"
          {
            id: "front_desk",
            label: "Front desk",
            kind: "front_desk",
            users: ups['count']
          }
        elsif ups['skill_id'] == "language_detector"
          {
            id: "language_detector",
            label: "Language detector",
            kind: "language_detector",
            users: ups['count']
          }
        else
          # behaviour was deleted or we don't know anything about it for other reasons
          nil
        end
      end.compact

    }

  end
end
