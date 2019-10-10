class CreateEpisode < ActiveRecord::Migration[6.0]
  def change
    create_table :episodes do |t|
      t.string :title
      t.datetime :pubDate
      t.string :link
      t.text :description
      t.string :content_encoded
      t.string :enclosure
      t.integer :itunes_duration
      t.boolean :itunes_explicit
      t.string :itunes_keywords
      t.string :itunes_subtitle
      t.string :itunes_episode
      t.string :itunes_episodeType
      t.integer :client_cost
      t.boolean :paid
      t.references :show, foreign_key: true
      t.timestamps
    end

    create_table :invoices do |t|
      t.integer :amount_due
      t.string :status
      t.integer :invoice_number
      t.datetime :invoice_date
      t.datetime :payment_due
      t.bigint :users
      t.text :notes
      t.timestamps
    end

    create_table :invoices_users, id: false do |t|
      t.belongs_to :invoice
      t.belongs_to :user
    end
  end
end
