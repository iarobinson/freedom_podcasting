# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2020_01_14_103454) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "action_text_rich_texts", force: :cascade do |t|
    t.string "name", null: false
    t.text "body"
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["record_type", "record_id", "name"], name: "index_action_text_rich_texts_uniqueness", unique: true
  end

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.bigint "byte_size", null: false
    t.string "checksum", null: false
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "episodes", force: :cascade do |t|
    t.string "title"
    t.datetime "pub_date"
    t.string "link"
    t.text "description"
    t.string "content_encoded"
    t.string "enclosure"
    t.string "itunes_duration"
    t.integer "duration"
    t.boolean "itunes_explicit"
    t.string "itunes_keywords"
    t.string "itunes_subtitle"
    t.string "itunes_episode"
    t.string "itunes_episodeType"
    t.integer "client_cost"
    t.boolean "paid"
    t.bigint "show_id"
    t.bigint "invoice_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["invoice_id"], name: "index_episodes_on_invoice_id"
    t.index ["show_id"], name: "index_episodes_on_show_id"
  end

  create_table "episodes_invoices", id: false, force: :cascade do |t|
    t.bigint "invoice_id"
    t.bigint "episode_id"
    t.index ["episode_id"], name: "index_episodes_invoices_on_episode_id"
    t.index ["invoice_id"], name: "index_episodes_invoices_on_invoice_id"
  end

  create_table "invoices", force: :cascade do |t|
    t.integer "amount_due_from_client"
    t.integer "amount_due_to_producer"
    t.string "status"
    t.integer "invoice_number"
    t.datetime "invoice_date"
    t.datetime "payment_due"
    t.datetime "start_date"
    t.datetime "end_date"
    t.text "notes"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "invoices_users", id: false, force: :cascade do |t|
    t.bigint "invoice_id"
    t.bigint "user_id"
    t.index ["invoice_id"], name: "index_invoices_users_on_invoice_id"
    t.index ["user_id"], name: "index_invoices_users_on_user_id"
  end

  create_table "messages", force: :cascade do |t|
    t.text "body"
    t.bigint "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_messages_on_user_id"
  end

  create_table "pages", force: :cascade do |t|
    t.string "title"
    t.string "heading"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "shows", force: :cascade do |t|
    t.string "title"
    t.string "host"
    t.string "website"
    t.string "category"
    t.string "description"
    t.string "subtitle"
    t.bigint "users_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "feed_url"
    t.string "category_one"
    t.string "category_two"
    t.string "category_three"
    t.index ["users_id"], name: "index_shows_on_users_id"
  end

  create_table "shows_users", id: false, force: :cascade do |t|
    t.bigint "show_id", null: false
    t.bigint "user_id", null: false
    t.index ["show_id", "user_id"], name: "index_shows_users_on_show_id_and_user_id"
    t.index ["user_id", "show_id"], name: "index_shows_users_on_user_id_and_show_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet "current_sign_in_ip"
    t.inet "last_sign_in_ip"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email"
    t.integer "failed_attempts", default: 0, null: false
    t.string "unlock_token"
    t.datetime "locked_at"
    t.string "first_name"
    t.string "last_name"
    t.string "address"
    t.string "city"
    t.string "state"
    t.string "country"
    t.string "zip"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name"
    t.string "status"
    t.integer "role"
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["unlock_token"], name: "index_users_on_unlock_token", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "episodes", "shows"
  add_foreign_key "messages", "users"
  add_foreign_key "shows", "users", column: "users_id"
end
