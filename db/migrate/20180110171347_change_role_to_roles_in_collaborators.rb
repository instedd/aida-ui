class ChangeRoleToRolesInCollaborators < ActiveRecord::Migration[5.1]
  def up
    add_column :collaborators, :roles, :string, array: true, default: []
    execute %(UPDATE collaborators SET roles='{"publish","behaviour","content","variables","results"}')
    remove_column :collaborators, :role
  end

  def down
    remove_column :collaborators, :roles
    add_column :collaborators, :role, :string
    execute %(UPDATE collaborators SET role='collaborator')
  end
end
