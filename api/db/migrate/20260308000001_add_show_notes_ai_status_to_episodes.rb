class AddShowNotesAiStatusToEpisodes < ActiveRecord::Migration[7.1]
  def change
    add_column :episodes, :show_notes_ai_status, :string
  end
end
