class InvitationPolicy < ApplicationPolicy
  include RolesMixin

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

  def bot
    record.bot
  end

  def is_recipient?
    record.email == user.email
  end

  def is_anonymous?
    record.anonymous?
  end
end
