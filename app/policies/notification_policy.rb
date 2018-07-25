class NotificationPolicy < ApplicationPolicy
  include RolesMixin

  def bot
    record.bot
  end

  class Scope < Scope
    def resolve
      joined_scope = scope.left_outer_joins(:bot).left_outer_joins({bot: :collaborators})
      joined_scope.where('bots.owner_id = ?', user.id).or(joined_scope.where('collaborators.user_id = ?', user.id))
    end
  end
end
