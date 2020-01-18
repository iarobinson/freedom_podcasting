class AddRoleToUsers < ActiveRecord::Migration[5.2]
  def change
    add_column :users, :role, :integer
    add_column :shows, :feed_url, :string
    add_column :shows, :category_one, :string
    add_column :shows, :category_two, :string
    add_column :shows, :category_three, :string
  end
end
