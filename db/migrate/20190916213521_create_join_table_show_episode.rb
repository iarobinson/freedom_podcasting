class CreateJoinTableShowEpisode < ActiveRecord::Migration[5.2]
  def change
    create_join_table :shows, :episodes do |t|
      # t.index [:show_id, :episode_id]
      # t.index [:episode_id, :show_id]
    end
  end
end
