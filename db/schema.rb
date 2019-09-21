# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2019_09_20_234920) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

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
    t.date "pubDate"
    t.string "link"
    t.string "description"
    t.string "content_encoded"
    t.string "enclosure"
    t.integer "itunes_duration"
    t.boolean "itunes_explicit"
    t.string "itunes_keywords"
    t.string "itunes_subtitle"
    t.string "itunes_episode"
    t.string "itunes_episodeType"
    t.integer "episode_number"
    t.integer "client_cost"
    t.bigint "show_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "feed_id"
    t.boolean "paid", default: false
    t.index ["feed_id"], name: "index_episodes_on_feed_id"
    t.index ["show_id"], name: "index_episodes_on_show_id"
  end

  create_table "feeds", force: :cascade do |t|
    t.string "name"
    t.string "url"
    t.text "description"
    t.bigint "show_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["show_id"], name: "index_feeds_on_show_id"
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
  add_foreign_key "episodes", "feeds"
  add_foreign_key "episodes", "shows"
  add_foreign_key "messages", "users"
  add_foreign_key "shows", "users", column: "users_id"
end
