class AddItunesContactEmailToShows < ActiveRecord::Migration[7.1]
  def change
    add_column :shows, :itunes_contact_email, :string
  end
end
