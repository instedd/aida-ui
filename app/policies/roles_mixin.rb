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

  def roles
    @roles ||= if collaborator = bot.collaborators.find { |c| c.user_id == user.id }
                 collaborator.roles
               else
                 []
               end
  end

  def can_admin?
    is_bot_owner?
  end

  def can_publish?
    is_bot_owner? or roles.include?('publish')
  end

  def can_message?
    is_bot_owner? or roles.include?('operator')
  end

  def manages_behaviour?
    is_bot_owner? or roles.include?('behaviour') or roles.include?('publish')
  end

  def manages_content?
    is_bot_owner? or roles.include?('content') or roles.include?('behaviour') or roles.include?('publish')
  end

  def manages_variables?
    is_bot_owner? or roles.include?('variables') or roles.include?('behaviour') or roles.include?('publish')
  end

  def manages_results?
    is_bot_owner? or roles.include?('results') or roles.include?('publish')
  end
end
