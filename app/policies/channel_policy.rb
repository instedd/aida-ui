class ChannelPolicy < ApplicationPolicy
  include RolesMixin

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
