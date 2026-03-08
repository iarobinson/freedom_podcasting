class AddAiMetadataStatusToEpisodes < ActiveRecord::Migration[7.1]
  def change
    add_column :episodes, :ai_metadata_status, :string
  end
end
