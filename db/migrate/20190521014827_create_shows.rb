class CreateShows < ActiveRecord::Migration[5.2]
  def change
    create_table :shows do |t|
      t.string :title
      t.string :host
      t.string :website
      t.string :category
      t.string :description
      t.string :subtitle

      t.timestamps
    end
  end
end
