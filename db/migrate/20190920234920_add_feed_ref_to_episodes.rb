class AddFeedRefToEpisodes < ActiveRecord::Migration[5.2]
  def change
    add_reference :episodes, :feed, foreign_key: true
    add_column :episodes, :paid, :boolean, default: false
  end
end
