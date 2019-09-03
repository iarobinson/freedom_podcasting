class CreateEpisodes < ActiveRecord::Migration[5.2]
  def change
    create_table :episodes do |t|
      t.string :title
      t.date :pubDate
      t.string :link
      t.string :description
      t.string :content_encoded
      t.string :enclosure
      t.integer :itunes_duration
      t.boolean :itunes_explicit
      t.string :itunes_keywords
      t.string :itunes_subtitle
      t.string :itunes_episode
      t.string :itunes_episodeType
      t.integer :episode_number

      t.integer :client_cost
      t.references :show, foreign_key: true

      t.timestamps
    end
  end
end
