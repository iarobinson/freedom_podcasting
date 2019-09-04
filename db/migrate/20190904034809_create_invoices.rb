class CreateInvoices < ActiveRecord::Migration[5.2]
  def change
    create_table :invoices do |t|
      t.boolean :paid
      t.references :episodes, foreign_key: true
    end

    create_join_table :episodes, :invoices do |t|
      t.index [:episode_id, :invoice_id]
      t.index [:invoice_id, :episode_id]
    end
  end
end
