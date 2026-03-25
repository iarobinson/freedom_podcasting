class CreatePodcastImports < ActiveRecord::Migration[7.1]
  def change
    create_table :podcast_imports do |t|
      t.references :organization,   null: false, foreign_key: true
      t.references :podcast,        null: true,  foreign_key: true
      t.text    :rss_url,           null: false
      t.string  :status,            null: false, default: "pending"
      t.integer :total_episodes,    null: false, default: 0
      t.integer :imported_episodes, null: false, default: 0
      t.text    :error_message
      t.timestamps
    end
  end
end
