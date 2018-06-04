class BotPolicy < ApplicationPolicy
  include RolesMixin

  def index?
    true
  end

  def create?
    true
  end

  def update?
    can_admin?
  end

  def destroy?
    can_admin?
  end

  def publish?
    can_publish?
  end

  def unpublish?
    can_publish?
  end

  def duplicate?
    can_admin?
  end

  def preview?
    has_access?
  end

  def download_manifest?
    can_publish?
  end

  def read_session_data?
    manages_results?
  end

  def read_usage_stats?
    manages_results?
  end

  def read_channels?
    can_publish?
  end

  def read_behaviours?
    manages_behaviour?
  end

  def create_skill?
    manages_behaviour?
  end

  def reorder_skills?
    manages_behaviour?
  end

  def read_translations?
    manages_content?
  end

  def update_translation?
    manages_content?
  end

  def read_variables?
    manages_variables?
  end

  def update_variable?
    manages_variables?
  end

  def destroy_variable?
    manages_variables?
  end

  def read_data_tables?
    manages_variables?
  end

  def create_data_table?
    manages_variables?
  end

  def read_collaborators?
    can_admin?
  end

  def invite_collaborator?
    can_admin?
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
      joined_scope.where(owner_id: user.id).or(joined_scope.where('collaborators.user_id = ?', user.id)).distinct
    end
  end
end
