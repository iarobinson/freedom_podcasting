# Pending invites for people who don't have an account yet. Invites to existing
# users live on their (unaccepted) Membership row instead.
class CreateInvitations < ActiveRecord::Migration[7.1]
  def change
    create_table :invitations do |t|
      t.references :organization, null: false, foreign_key: true
      t.references :invited_by, foreign_key: { to_table: :users }
      t.string   :email, null: false
      t.string   :role,  null: false
      t.datetime :expires_at, null: false
      t.timestamps
    end
    add_index :invitations, [:organization_id, :email], unique: true
  end
end
