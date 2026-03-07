class AddTranscriptionStatusToEpisodes < ActiveRecord::Migration[7.1]
  def change
    add_column :episodes, :transcription_status, :string
  end
end
