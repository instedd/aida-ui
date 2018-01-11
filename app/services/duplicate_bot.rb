class DuplicateBot
  def self.run(bot, owner)
    Bot.transaction do
      duplicate = Bot.create_prepared! owner

      name, copy_number = find_last_accessible_copy(bot.name, owner)
      duplicate.update_attributes! name: build_duplicate_name(name, copy_number + 1)

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

  def self.find_last_accessible_copy(bot_name, owner)
    name, last_copy = extract_name_and_copy_number(bot_name)
    accessible_names = Pundit.policy_scope(owner, Bot).pluck(:name)
    names_and_copies = accessible_names.map { |x| extract_name_and_copy_number(x) }
    names_and_copies.each do |x|
      if x.first == name && x.second > last_copy
        last_copy = x.second
      end
    end
    [name, last_copy]
  end

  def self.extract_name_and_copy_number(name)
    if match_data = /\A(?<name>.*)( copy( (?<copy>\d+))?)\Z/.match(name)
      copy = if match_data[:copy].nil?
               1
             else
               match_data[:copy].to_i
             end
      [match_data[:name], copy]
    else
      [name, 0]
    end
  end

  def self.build_duplicate_name(name, copy)
    if copy == 1
      "#{name} copy"
    else
      "#{name} copy #{copy}"
    end
  end

  private

  def self.duplicate_translations(behaviour, dup_behaviour)
    behaviour.translations.each do |translation|
      dup_behaviour.translations.create! lang: translation.lang,
                                         key: translation.key,
                                         value: translation.value
    end
  end
end
