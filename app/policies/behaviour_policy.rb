class BehaviourPolicy < ApplicationPolicy
  include RolesMixin

  def update?
    manages_behaviour?
  end

  def destroy?
    !is_front_desk? and manages_behaviour?
  end

  def is_front_desk?
    record.kind == 'front_desk'
  end

  def bot
    record.bot
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
