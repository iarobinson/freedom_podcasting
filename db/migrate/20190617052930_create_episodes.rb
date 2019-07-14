class CreateEpisodes < ActiveRecord::Migration[5.2]
  def change
    create_table :episodes do |t|
      t.string :title
      t.integer :number
      t.integer :client_cost
      t.references :show, foreign_key: true

      t.timestamps
    end
  end
end
