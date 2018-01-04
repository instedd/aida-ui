class BotPolicy < ApplicationPolicy
  def index?
    true
  end

  def create?
    true
  end

  def update?
    is_owner? or is_collaborator?
  end

  def destroy?
    is_owner? or is_collaborator?
  end

  def publish?
    is_owner? or is_collaborator?
  end

  def unpublish?
    is_owner? or is_collaborator?
  end

  def preview?
    is_owner? or is_collaborator?
  end

  def read_session_data?
    is_owner? or is_collaborator?
  end

  def read_usage_stats?
    is_owner? or is_collaborator?
  end

  def read_channels?
    is_owner? or is_collaborator?
  end

  def read_behaviours?
    is_owner? or is_collaborator?
  end

  def create_skill?
    is_owner? or is_collaborator?
  end

  def read_translations?
    is_owner? or is_collaborator?
  end

  def update_translation?
    is_owner? or is_collaborator?
  end

  def read_collaborators?
    is_owner? or is_collaborator?
  end

  def invite_collaborator?
    is_owner? or is_collaborator?
  end

  def is_owner?
    record.owner_id == user.id
  end

  def is_collaborator?
    record.collaborators.any? { |c| c.user_id == user.id }
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
