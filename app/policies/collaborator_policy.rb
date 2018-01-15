class CollaboratorPolicy < ApplicationPolicy
  include RolesMixin

  def destroy?
    can_admin?
  end

  def update?
    can_admin?
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
