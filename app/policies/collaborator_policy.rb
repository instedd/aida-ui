class CollaboratorPolicy < ApplicationPolicy
  include RolesMixin

  def destroy?
    is_bot_owner? or (is_collaborator? and !is_self?)
  end

  def update?
    is_bot_owner?
  end

  def bot
    record.bot
  end

  def is_self?
    record.user_id == user.id
  end

  def permitted_attributes
    {:roles => []}
  end
end
