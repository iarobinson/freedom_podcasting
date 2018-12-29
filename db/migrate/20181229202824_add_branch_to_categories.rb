class AddBranchToCategories < ActiveRecord::Migration[5.2]
  def change
    add_column :categories, :branch, :string
  end
end
