class AddCategoryIdToPosts < ActiveRecord::Migration[5.2]
  def change
    add_reference :categories, :posts
  end
end
