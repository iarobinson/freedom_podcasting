class AddProfileToUsers < ActiveRecord::Migration[5.2]
  def change
    add_reference :profiles, :user
  end
end
