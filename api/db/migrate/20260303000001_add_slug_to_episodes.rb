class AddSlugToEpisodes < ActiveRecord::Migration[7.1]
  def change
    add_column :episodes, :slug, :string
    add_index  :episodes, [:podcast_id, :slug], unique: true, where: "slug IS NOT NULL"
  end
end
