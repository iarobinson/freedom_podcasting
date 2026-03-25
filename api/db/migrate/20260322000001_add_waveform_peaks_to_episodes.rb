class AddWaveformPeaksToEpisodes < ActiveRecord::Migration[7.1]
  def change
    add_column :episodes, :waveform_peaks, :jsonb
  end
end
