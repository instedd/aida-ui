class BehaviourPolicy < ApplicationPolicy
  def update?
    is_bot_owner? or is_collaborator?
  end

  def destroy?
    !is_front_desk? and (is_bot_owner? or is_collaborator?)
  end

  def is_front_desk?
    record.kind == 'front_desk'
  end

  def is_bot_owner?
    record.bot.owner_id == user.id
  end

  def is_collaborator?
    record.bot.collaborators.any? { |c| c.user_id == user.id }
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
