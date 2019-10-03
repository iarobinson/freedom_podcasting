class AddInvoiceToEpisodes < ActiveRecord::Migration[6.0]
  def change
    add_reference :episodes, :invoice, foreign_key: true
  end
end
