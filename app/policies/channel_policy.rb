class ChannelPolicy < ApplicationPolicy
  def update?
    is_bot_owner? or is_collaborator?
  end

  def is_bot_owner?
    user.id == record.bot.owner_id
  end

  def is_collaborator?
    record.bot.collaborators.any? { |c| c.user_id == user.id }
  end

  def permitted_attributes
    [:name, config: {}]
  end
end
