class AddContentToPages < ActiveRecord::Migration[5.2]
  def change
    add_column :pages, :content, :string
  end
end
