class AddContentToPosts < ActiveRecord::Migration[5.2]
  def change
    add_column :posts, :content, :text
  end
end
