class PersonalAccessToken < ApplicationRecord
  belongs_to :user
  belongs_to :organization

  validates :name,         presence: true, length: { maximum: 100 }
  validates :token_digest, presence: true, uniqueness: true
  validates :token_prefix, presence: true
  validates :scopes,       inclusion: { in: %w[wordpress] }

  scope :active, -> {
    where(revoked_at: nil)
      .where("expires_at IS NULL OR expires_at > ?", Time.current)
  }

  # Generates a new PAT for the given user + org.
  # Returns [record, plaintext] — plaintext is shown exactly once.
  def self.generate_for(user:, organization:, name:)
    plaintext = "fp_pat_#{SecureRandom.urlsafe_base64(32)}"
    prefix    = plaintext[7, 12]  # 12 chars after "fp_pat_"
    digest    = BCrypt::Password.create(plaintext)

    record = create!(
      user:         user,
      organization: organization,
      name:         name,
      token_prefix: prefix,
      token_digest: digest
    )

    [ record, plaintext ]
  end

  # Finds and validates a raw token string.
  # Returns the record if valid and active, nil otherwise.
  def self.authenticate(raw_token)
    return nil unless raw_token&.start_with?("fp_pat_")

    prefix = raw_token[7, 12]
    candidates = active.where(token_prefix: prefix).includes(:user, :organization)

    candidates.find do |record|
      BCrypt::Password.new(record.token_digest) == raw_token
    end&.tap do |record|
      record.touch(:last_used_at)
    end
  end

  def revoke!
    update!(revoked_at: Time.current)
  end

  def active?
    revoked_at.nil? && (expires_at.nil? || expires_at > Time.current)
  end
end
