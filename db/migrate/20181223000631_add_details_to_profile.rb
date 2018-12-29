class AddDetailsToProfile < ActiveRecord::Migration[5.2]
  def change
    add_column :profiles, :address, :string
    add_column :profiles, :sex, :string
    add_column :profiles, :linkedin_url, :string
    add_column :profiles, :instagram_url, :string
    add_column :profiles, :facebook_url, :string
    add_column :profiles, :twitter_url, :string
    add_column :profiles, :description, :text
    add_column :profiles, :last_name, :string
    add_column :profiles, :first_name, :string
  end
end
