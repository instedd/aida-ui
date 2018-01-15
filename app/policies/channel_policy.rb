class ChannelPolicy < ApplicationPolicy
  include RolesMixin

  def update?
    is_bot_owner? or is_collaborator?
  end

  def bot
    record.bot
  end

  def permitted_attributes
    [:name, config: {}]
  end
end
