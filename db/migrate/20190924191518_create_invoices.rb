class CreateInvoices < ActiveRecord::Migration[5.2]
  def change
    create_table :invoices do |t|
      t.integer :amount_due
      t.string :status
      t.integer :invoice_number
      t.datetime :invoice_date
      t.datetime :payment_due
      t.references :users, foreign_key: true
      t.text :notes

      t.timestamps
    end
  end
end
