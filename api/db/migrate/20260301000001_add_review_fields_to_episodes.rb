class AddReviewFieldsToEpisodes < ActiveRecord::Migration[7.1]
  def change
    add_column :episodes, :reviewed_by_id, :integer
    add_column :episodes, :reviewed_at,    :datetime
    add_column :episodes, :review_notes,   :text

    add_foreign_key :episodes, :users, column: :reviewed_by_id
    add_index :episodes, :reviewed_by_id
  end
end
