class ChannelPolicy < ApplicationPolicy
  def update?
    user.id == record.bot.owner_id
  end

  def permitted_attributes
    [:name, config: {}]
  end
end
