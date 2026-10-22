class AddBillingIntervalToOrganizations < ActiveRecord::Migration[7.1]
  def change
    add_column :organizations, :billing_interval, :string, null: false, default: "month"
  end
end
