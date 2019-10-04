class CreateEpisode < ActiveRecord::Migration[6.0]
  def change
    create_table :episodes do |t|
      t.string :title
      t.integer :number
      t.integer :client_cost
      t.references :show, foreign_key: true
    end
  end
end
