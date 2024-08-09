require "rss"

class Rss::GenerateRssService < ApplicationService
  attr_reader :url

  def initialize
    @url = "https://podcasts.apple.com/us/podcast/lex-fridman-podcast/id1434243584?i=1000664170388"
  end

  def go
    rss = RSS::Maker.make("atom") do |maker|
      maker.channel.author = "matz"
      maker.channel.updated = Time.now.to_s
      maker.channel.about = "https://www.ruby-lang.org/en/feeds/news.rss"
      maker.channel.title = "Example Feed"

      maker.items.new_item do |item|
        item.link = "https://www.ruby-lang.org/en/news/2010/12/25/ruby-1-9-2-p136-is-released/"
        item.title = "Ruby 1.9.2-p136 is released"
        item.updated = Time.now.to_s
      end
    end
    puts rss
  end
end