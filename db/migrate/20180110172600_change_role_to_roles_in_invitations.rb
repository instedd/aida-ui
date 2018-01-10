class ChangeRoleToRolesInInvitations < ActiveRecord::Migration[5.1]
  def up
    add_column :invitations, :roles, :string, array: true, default: []
    execute %(UPDATE invitations SET roles='{"publish","behaviour","content","variables","results"}')
    remove_column :invitations, :role
  end

  def down
    remove_column :invitations, :roles
    add_column :invitations, :role, :string
    execute %(UPDATE invitations SET role='collaborator')
  end
end
