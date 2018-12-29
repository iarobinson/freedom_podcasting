class CreateTags < ActiveRecord::Migration[5.2]
  def change
    create_table :tags do |t|
      t.integer :post_id
      t.string :tag

      t.timestamps
    end
    add_index :tags, :post_id
  end
end
