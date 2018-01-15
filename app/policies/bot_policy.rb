class BotPolicy < ApplicationPolicy
  include RolesMixin

  def index?
    true
  end

  def create?
    true
  end

  def update?
    is_bot_owner? or is_collaborator?
  end

  def destroy?
    is_bot_owner? or is_collaborator?
  end

  def publish?
    is_bot_owner? or is_collaborator?
  end

  def unpublish?
    is_bot_owner? or is_collaborator?
  end

  def duplicate?
    is_bot_owner? or is_collaborator?
  end

  def preview?
    is_bot_owner? or is_collaborator?
  end

  def download_manifest?
    is_bot_owner? or is_collaborator?
  end

  def read_session_data?
    is_bot_owner? or is_collaborator?
  end

  def read_usage_stats?
    is_bot_owner? or is_collaborator?
  end

  def read_channels?
    is_bot_owner? or is_collaborator?
  end

  def read_behaviours?
    is_bot_owner? or is_collaborator?
  end

  def create_skill?
    is_bot_owner? or is_collaborator?
  end

  def read_translations?
    is_bot_owner? or is_collaborator?
  end

  def update_translation?
    is_bot_owner? or is_collaborator?
  end

  def read_collaborators?
    is_bot_owner? or is_collaborator?
  end

  def invite_collaborator?
    is_bot_owner? or is_collaborator?
  end

  def bot
    record
  end

  def permitted_attributes
    [:name]
  end

  class Scope < Scope
    def resolve
      joined_scope = scope.left_outer_joins(:collaborators)
      joined_scope.where(owner_id: user.id).or(joined_scope.where('collaborators.user_id = ?', user.id))
    end
  end
end
