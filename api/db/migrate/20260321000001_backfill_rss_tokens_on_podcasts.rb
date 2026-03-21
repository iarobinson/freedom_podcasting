class BackfillRssTokensOnPodcasts < ActiveRecord::Migration[7.1]
  def up
    Podcast.where(rss_token: nil).find_each do |podcast|
      podcast.update_column(:rss_token, SecureRandom.urlsafe_base64(24))
    end
    change_column_null :podcasts, :rss_token, false
  end

  def down
    change_column_null :podcasts, :rss_token, true
  end
end
