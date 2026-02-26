class CreateOrganizations < ActiveRecord::Migration[7.1]
  def change
    create_table :organizations do |t|
      t.string  :name, null: false
      t.string  :slug, null: false
      t.string  :plan, null: false, default: "free"
      t.string  :stripe_customer_id
      t.string  :stripe_subscription_id
      t.datetime :suspended_at
      t.string  :logo_url
      t.text    :description
      t.timestamps
    end
    add_index :organizations, :slug, unique: true
  end
end
