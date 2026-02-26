class CreateEpisodes < ActiveRecord::Migration[7.1]
  def change
    create_table :episodes do |t|
      t.references :podcast, null: false, foreign_key: true
      t.string  :title,       null: false
      t.text    :description, null: false
      t.text    :summary
      t.string  :artwork_url
      t.string  :audio_url
      t.bigint  :audio_file_size
      t.integer :audio_duration_seconds
      t.string  :audio_content_type
      t.string  :guid,         null: false
      t.string  :episode_type, default: "full", null: false
      t.integer :episode_number
      t.integer :season_number
      t.boolean :explicit,     default: false, null: false
      t.string  :keywords
      t.text    :transcript
      t.text    :show_notes_ai
      t.jsonb   :chapters,     default: []
      t.string  :status,       default: "draft", null: false
      t.datetime :published_at
      t.integer  :download_count, default: 0, null: false
      t.timestamps
    end
    add_index :episodes, :guid,       unique: true
    add_index :episodes, :status
    add_index :episodes, :published_at
  end
end
