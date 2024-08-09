class Show < ApplicationRecord
  has_and_belongs_to_many :users
  has_one_attached :show_art, dependent: :destroy
  has_many :episodes, dependent: :destroy

  def podcast_rss_feed_url
    formatted_title = self.title.underscore.gsub(" ", "-")
    root_url + formatted_title
  end

  def categories
    [
      "Arts",
      "Arts - Design",
      "Arts - Fashion & Beauty",
      "Arts - Food",
      "Arts - Literature",
      "Arts - Performing Arts",
      "Arts - Visual Arts",
      "Business",
      "Business - Business News",
      "Business - Careers",
      "Business - Investing",
      "Business - Management & Marketing",
      "Business - Shopping",
      "Comedy",
      "Education",
      "Education - Educational Technology",
      "Education - Higher Education",
      "Education - K-12",
      "Education - Language Courses",
      "Education - Training",
      "Games & Hobbies",
      "Games & Hobbies - Automotive",
      "Games & Hobbies - Aviation",
      "Games & Hobbies - Hobbies",
      "Games & Hobbies - Other Games",
      "Games & Hobbies - Video Games",
      "Government & Organizations",
      "Government & Organizations - Local",
      "Government & Organizations - National",
      "Government & Organizations - Non-Profit",
      "Government & Organizations - Regional",
      "Health",
      "Health - Alternative Health",
      "Health - Fitness & Nutrition",
      "Health - Self-Help",
      "Health - Sexuality",
      "Kids & Family",
      "Music",
      "News & Politics",
      "Religion & Spirituality",
      "Religion & Spirituality - Buddhism",
      "Religion & Spirituality - Christianity",
      "Religion & Spirituality - Hinduism",
      "Religion & Spirituality - Islam",
      "Religion & Spirituality - Judaism",
      "Religion & Spirituality - Other",
      "Religion & Spirituality - Spirituality",
      "Science & Medicine",
      "Science & Medicine - Medicine",
      "Science & Medicine - Natural Sciences",
      "Science & Medicine - Social Sciences",
      "Society & Culture",
      "Society & Culture - History",
      "Society & Culture - Personal Journals",
      "Society & Culture - Philosophy",
      "Society & Culture - Places & Travel",
      "Sports & Recreation",
      "Sports & Recreation - Amateur",
      "Sports & Recreation - College & High School",
      "Sports & Recreation - Outdoor",
      "Sports & Recreation - Professional",
      "Technology",
      "Technology - Gadgets",
      "Technology - Tech News",
      "Technology - Podcasting",
      "Technology - Software How-To",
      "TV & Film"
    ]
  end
end
