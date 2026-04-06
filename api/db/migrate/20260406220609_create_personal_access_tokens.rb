class CreatePersonalAccessTokens < ActiveRecord::Migration[7.1]
  def change
    create_table :personal_access_tokens do |t|
      t.bigint   :user_id,         null: false
      t.bigint   :organization_id, null: false
      t.string   :token_digest,    null: false  # BCrypt hash of plaintext
      t.string   :token_prefix,    null: false  # first 12 chars after "fp_pat_" for fast lookup
      t.string   :name,            null: false  # e.g. "WordPress - mysite.com"
      t.string   :scopes,          null: false, default: "wordpress"
      t.datetime :last_used_at
      t.datetime :expires_at       # null = never expires
      t.datetime :revoked_at       # null = active
      t.timestamps
    end

    add_index :personal_access_tokens, :user_id
    add_index :personal_access_tokens, :organization_id
    add_index :personal_access_tokens, :token_prefix
    add_index :personal_access_tokens, :token_digest, unique: true
    add_foreign_key :personal_access_tokens, :users
    add_foreign_key :personal_access_tokens, :organizations
  end
end
