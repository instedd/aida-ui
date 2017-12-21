class InvitationPolicy < ApplicationPolicy
  def resend?
    is_bot_owner? or is_collaborator?
  end

  def destroy?
    is_bot_owner? or is_collaborator?
  end

  def retrieve?
    !has_access? and (is_recipient? or is_anonymous?)
  end

  def accept?
    !has_access? and (is_recipient? or is_anonymous?)
  end

  def is_bot_owner?
    record.bot.owner_id == user.id
  end

  def is_collaborator?
    record.bot.collaborators.any? { |c| c.user_id == user.id }
  end

  def has_access?
    is_bot_owner? or is_collaborator?
  end

  def is_recipient?
    record.email == user.email
  end

  def is_anonymous?
    record.anonymous?
  end
end
