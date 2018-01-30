class DataTablePolicy < ApplicationPolicy
  include RolesMixin

  def show?
    manages_variables?
  end

  def update?
    manages_variables?
  end

  def destroy?
    manages_variables?
  end

  def bot
    record.bot
  end

  def permitted_attributes
    [:name, :data => []]
  end
end
