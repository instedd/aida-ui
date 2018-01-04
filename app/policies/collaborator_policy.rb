class CollaboratorPolicy < ApplicationPolicy
  def destroy?
    is_bot_owner? or (is_collaborator? and !is_self?)
  end

  def is_bot_owner?
    record.bot.owner_id == user.id
  end

  def is_collaborator?
    record.bot.collaborators.any? { |c| c.user_id == user.id }
  end

  def is_self?
    record.user_id == user.id
  end
end
