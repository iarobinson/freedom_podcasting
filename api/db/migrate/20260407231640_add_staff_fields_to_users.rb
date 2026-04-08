class AddStaffFieldsToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :is_staff,   :boolean, default: false, null: false
    add_column :users, :staff_role, :string
    add_index  :users, :is_staff
  end
end
