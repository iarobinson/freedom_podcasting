class AddSkippedEpisodesToPodcastImports < ActiveRecord::Migration[7.1]
  def change
    add_column :podcast_imports, :skipped_episodes, :integer, null: false, default: 0
  end
end
