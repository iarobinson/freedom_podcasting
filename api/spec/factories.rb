FactoryBot.define do
  factory :user do
    first_name { Faker::Name.first_name }
    last_name  { Faker::Name.last_name }
    email      { Faker::Internet.unique.email }
    password   { "Password123!" }
  end
  factory :organization do
    name { Faker::Company.name }
    slug { Faker::Internet.unique.slug(glue: "-") }
    plan { "free" }
  end
  factory :membership do
    user; organization; role { "owner" }; accepted_at { Time.current }
  end
  factory :podcast do
    organization
    title { Faker::Music.band }; description { Faker::Lorem.paragraph }
    author { Faker::Name.name }; email { Faker::Internet.email }
    slug { Faker::Internet.unique.slug(glue: "-") }
    language { "en" }; category { "Technology" }; podcast_type { "episodic" }; published { false }
  end
  factory :episode do
    podcast
    title { Faker::Lorem.sentence(word_count: 5) }
    description { Faker::Lorem.paragraphs(number: 3).join("\n\n") }
    episode_type { "full" }; status { "draft" }; explicit { false }
    trait :published do
      status { "published" }; published_at { 1.day.ago }
      audio_url { "https://media.freedompodcasting.com/audio/test.mp3" }
      audio_content_type { "audio/mpeg" }; audio_file_size { 50_000_000 }; audio_duration_seconds { 3600 }
    end
  end
end
