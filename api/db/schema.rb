# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2026_03_21_000001) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "episodes", force: :cascade do |t|
    t.bigint "podcast_id", null: false
    t.string "title", null: false
    t.text "description", null: false
    t.text "summary"
    t.string "artwork_url"
    t.string "audio_url"
    t.bigint "audio_file_size"
    t.integer "audio_duration_seconds"
    t.string "audio_content_type"
    t.string "guid", null: false
    t.string "episode_type", default: "full", null: false
    t.integer "episode_number"
    t.integer "season_number"
    t.boolean "explicit", default: false, null: false
    t.string "keywords"
    t.text "transcript"
    t.text "show_notes_ai"
    t.jsonb "chapters", default: []
    t.string "status", default: "draft", null: false
    t.datetime "published_at"
    t.integer "download_count", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "reviewed_by_id"
    t.datetime "reviewed_at"
    t.text "review_notes"
    t.string "slug"
    t.string "transcription_status"
    t.string "show_notes_ai_status"
    t.string "ai_metadata_status"
    t.datetime "ai_purchased_at"
    t.string "audio_filename"
    t.index ["guid"], name: "index_episodes_on_guid", unique: true
    t.index ["podcast_id", "slug"], name: "index_episodes_on_podcast_id_and_slug", unique: true, where: "(slug IS NOT NULL)"
    t.index ["podcast_id"], name: "index_episodes_on_podcast_id"
    t.index ["published_at"], name: "index_episodes_on_published_at"
    t.index ["reviewed_by_id"], name: "index_episodes_on_reviewed_by_id"
    t.index ["status"], name: "index_episodes_on_status"
  end

  create_table "media_files", force: :cascade do |t|
    t.bigint "organization_id", null: false
    t.bigint "episode_id"
    t.bigint "podcast_id"
    t.string "filename", null: false
    t.string "content_type", null: false
    t.bigint "file_size"
    t.string "r2_key", null: false
    t.string "processing_status", default: "pending", null: false
    t.integer "duration_seconds"
    t.jsonb "metadata", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["episode_id"], name: "index_media_files_on_episode_id"
    t.index ["organization_id"], name: "index_media_files_on_organization_id"
    t.index ["podcast_id"], name: "index_media_files_on_podcast_id"
    t.index ["r2_key"], name: "index_media_files_on_r2_key", unique: true
  end

  create_table "memberships", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "organization_id", null: false
    t.string "role", default: "viewer", null: false
    t.datetime "invited_at"
    t.datetime "accepted_at"
    t.string "invitation_token"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["organization_id"], name: "index_memberships_on_organization_id"
    t.index ["user_id", "organization_id"], name: "index_memberships_on_user_id_and_organization_id", unique: true
    t.index ["user_id"], name: "index_memberships_on_user_id"
  end

  create_table "organizations", force: :cascade do |t|
    t.string "name", null: false
    t.string "slug", null: false
    t.string "plan", default: "free", null: false
    t.string "stripe_customer_id"
    t.string "stripe_subscription_id"
    t.datetime "suspended_at"
    t.string "logo_url"
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_organizations_on_slug", unique: true
  end

  create_table "podcasts", force: :cascade do |t|
    t.bigint "organization_id", null: false
    t.string "title", null: false
    t.text "description", null: false
    t.string "author", null: false
    t.string "email", null: false
    t.string "slug", null: false
    t.string "artwork_url"
    t.string "language", default: "en"
    t.string "category"
    t.string "subcategory"
    t.boolean "explicit", default: false, null: false
    t.string "podcast_type", default: "episodic", null: false
    t.string "website_url"
    t.string "copyright"
    t.boolean "published", default: false, null: false
    t.datetime "published_at"
    t.string "rss_token", null: false
    t.string "custom_domain"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "apple_podcasts_url"
    t.string "spotify_url"
    t.string "amazon_music_url"
    t.index ["organization_id", "slug"], name: "index_podcasts_on_organization_id_and_slug", unique: true
    t.index ["organization_id"], name: "index_podcasts_on_organization_id"
    t.index ["published"], name: "index_podcasts_on_published"
    t.index ["rss_token"], name: "index_podcasts_on_rss_token", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "failed_attempts", default: 0, null: false
    t.string "unlock_token"
    t.datetime "locked_at"
    t.string "jti", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["jti"], name: "index_users_on_jti", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "episodes", "podcasts"
  add_foreign_key "episodes", "users", column: "reviewed_by_id"
  add_foreign_key "media_files", "episodes"
  add_foreign_key "media_files", "organizations"
  add_foreign_key "media_files", "podcasts"
  add_foreign_key "memberships", "organizations"
  add_foreign_key "memberships", "users"
  add_foreign_key "podcasts", "organizations"
end
