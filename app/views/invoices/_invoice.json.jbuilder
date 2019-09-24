json.extract! invoice, :id, :amount_due, :status, :invoice_number, :invoice_date, :payment_due, :users_id, :notes, :created_at, :updated_at
json.url invoice_url(invoice, format: :json)
