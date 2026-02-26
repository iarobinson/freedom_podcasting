class CreatePodcasts < ActiveRecord::Migration[7.1]
  def change
    create_table :podcasts do |t|
      t.references :organization, null: false, foreign_key: true
      t.string  :title,       null: false
      t.text    :description, null: false
      t.string  :author,      null: false
      t.string  :email,       null: false
      t.string  :slug,        null: false
      t.string  :artwork_url
      t.string  :language,     default: "en"
      t.string  :category
      t.string  :subcategory
      t.boolean :explicit,     default: false, null: false
      t.string  :podcast_type, default: "episodic", null: false
      t.string  :website_url
      t.string  :copyright
      t.boolean :published,    default: false, null: false
      t.datetime :published_at
      t.string  :rss_token,   null: false
      t.string  :custom_domain
      t.timestamps
    end
    add_index :podcasts, :slug,     unique: true
    add_index :podcasts, :rss_token, unique: true
    add_index :podcasts, :published
  end
end
