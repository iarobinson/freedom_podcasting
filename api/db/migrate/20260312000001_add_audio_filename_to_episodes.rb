class AddAudioFilenameToEpisodes < ActiveRecord::Migration[7.1]
  def change
    add_column :episodes, :audio_filename, :string
  end
end
