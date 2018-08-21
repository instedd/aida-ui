class ChannelPolicy < ApplicationPolicy
  include RolesMixin

  def destroy?
    can_publish?
  end

  def update?
    can_publish?
  end

  def bot
    record.bot
  end

  def permitted_attributes
    [:name, config: {}]
  end
end
