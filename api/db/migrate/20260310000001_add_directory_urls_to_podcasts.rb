class AddDirectoryUrlsToPodcasts < ActiveRecord::Migration[7.1]
  def change
    add_column :podcasts, :apple_podcasts_url, :string
    add_column :podcasts, :spotify_url,        :string
    add_column :podcasts, :amazon_music_url,   :string
  end
end
