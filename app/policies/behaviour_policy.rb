class BehaviourPolicy < ApplicationPolicy
  def update?
    is_bot_owner?
  end

  def destroy?
    is_bot_owner?
  end

  def is_bot_owner?
    record.bot.owner_id == user.id
  end

  def permitted_attributes
    case record.kind
    when 'front_desk'
      [config: {}]
    when 'language_detector'
      [:enabled, config: {}]
    else
      [:name, :enabled, config: {}]
    end
  end
end
