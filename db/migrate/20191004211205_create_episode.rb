class CreateEpisode < ActiveRecord::Migration[6.0]
  def change
    create_table :episodes do |t|
      t.string :title
      t.string :itunes_author
      t.string :itunes_summary
      t.string :entry_id
      t.string :summary
      t.datetime :pub_date
      t.string :published
      t.string :link
      t.string :url
      t.text :description
      t.string :content_encoded
      t.string :enclosure
      t.string :enclosure_url
      t.string :enclosure_type
      t.string :enclosure_length
      t.string :itunes_duration
      t.integer :duration
      t.boolean :itunes_explicit
      t.string :itunes_keywords
      t.string :itunes_subtitle
      t.string :itunes_episode
      t.string :itunes_episodeType
      t.integer :client_cost
      t.boolean :paid
      t.references :show, foreign_key: true
      t.belongs_to :invoice
      t.timestamps
    end

    create_table :invoices do |t|
      t.integer :amount_due_from_client
      t.integer :amount_due_to_producer
      t.string :status
      t.integer :invoice_number
      t.datetime :invoice_date
      t.datetime :payment_due
      t.datetime :start_date
      t.datetime :end_date
      t.text :notes
      t.timestamps
    end

    create_table :invoices_users, id: false do |t|
      t.belongs_to :invoice
      t.belongs_to :user
    end

    create_table :episodes_invoices, id: false do |t|
      t.belongs_to :invoice
      t.belongs_to :episode
    end
  end
end
