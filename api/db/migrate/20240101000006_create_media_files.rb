class CreateMediaFiles < ActiveRecord::Migration[7.1]
  def change
    create_table :media_files do |t|
      t.references :organization, null: false, foreign_key: true
      t.references :episode,      null: true,  foreign_key: true
      t.references :podcast,      null: true,  foreign_key: true
      t.string  :filename,          null: false
      t.string  :content_type,      null: false
      t.bigint  :file_size
      t.string  :r2_key,            null: false
      t.string  :processing_status, null: false, default: "pending"
      t.integer :duration_seconds
      t.jsonb   :metadata,          default: {}
      t.timestamps
    end
    add_index :media_files, :r2_key, unique: true
  end
end
