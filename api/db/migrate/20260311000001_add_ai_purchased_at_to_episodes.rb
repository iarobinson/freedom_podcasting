class AddAiPurchasedAtToEpisodes < ActiveRecord::Migration[7.1]
  def change
    add_column :episodes, :ai_purchased_at, :datetime
  end
end
