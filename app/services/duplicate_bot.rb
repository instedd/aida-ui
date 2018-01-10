class DuplicateBot
  def self.run(bot, owner)
    Bot.transaction do
      duplicate = Bot.create_prepared! owner
      duplicate.update_attributes! name: duplicate_name(bot.name)
      duplicate.front_desk.update_attributes! config: bot.front_desk.config
      duplicate_translations(bot.front_desk, duplicate.front_desk)
      bot.skills.each do |skill|
        dup_skill = duplicate.skills.create_skill! skill.kind, {
                                                     name: skill.name,
                                                     enabled: skill.enabled,
                                                     order: skill.order,
                                                     config: skill.config
                                                   }
        duplicate_translations(skill, dup_skill)
      end
      bot.variable_assignments.each do |var|
        duplicate.variable_assignments.create! variable_id: var.variable_id,
                                               variable_name: var.variable_name,
                                               condition_id: var.condition_id,
                                               condition: var.condition,
                                               condition_order: var.condition_order,
                                               lang: var.lang,
                                               value: var.value
      end
      duplicate
    end
  end

  private

  def self.duplicate_name(name)
    if name.ends_with?('copy')
      "#{name} 2"
    elsif name =~ /\A(.*) copy (\d+)\Z/
      "#{$1} copy #{$2.to_i + 1}"
    else
      "#{name} copy"
    end
  end

  def self.duplicate_translations(behaviour, dup_behaviour)
    behaviour.translations.each do |translation|
      dup_behaviour.translations.create! lang: translation.lang,
                                         key: translation.key,
                                         value: translation.value
    end
  end
end
