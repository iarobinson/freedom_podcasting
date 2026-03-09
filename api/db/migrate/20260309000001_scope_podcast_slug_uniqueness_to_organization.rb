class ScopePodcastSlugUniquenessToOrganization < ActiveRecord::Migration[7.1]
  def change
    remove_index :podcasts, :slug
    add_index :podcasts, [:organization_id, :slug], unique: true
  end
end
