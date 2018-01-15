module RolesMixin
  def is_bot_owner?
    user.id == bot.owner_id
  end

  def is_collaborator?
    bot.collaborators.any? { |c| c.user_id == user.id }
  end

  def has_access?
    is_bot_owner? or is_collaborator?
  end
end
