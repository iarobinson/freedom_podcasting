class Feed::SaveShowService < ApplicationService
  def initialize(params)
    @show = params
    @feed_url = params[:feed_url]
  end

  def perform
    xml = HTTParty.get(@feed_url).body
    content = Feedjira.parse(xml)
    content.entries.each do |episode|
      if Episode.all.where(title: episode.title).size.zero?
        cost = calculate_episode_cost(episode.itunes_duration) if episode.itunes_duration

        new_episode = Episode.new(
          client_cost: cost,
          title: episode.title,
          pub_date: episode.published,
          content_encoded: episode.content,
          enclosure: episode.enclosure_url,
          description: episode.itunes_summary,
          itunes_duration: episode.itunes_duration
        )
        new_episode.show = @show
        new_episode.save
      end
    end

    file = open(content.itunes_image)
    custom_file_name = content.title.downcase.gsub(/[^a-z ]/, '').gsub(" ", "_") + "_show_art"
    @show.show_art.attach(io: file, filename: custom_file_name, content_type: "image/jpg")
    @show.title = content.title
    @show.host = content.itunes_author
    @show.category = content.itunes_categories
    @show.description = content.description

    @show.save
  end

  private

    def calculate_episode_cost(duration_string)
      total_minutes = 0
      time_array = duration_string.split(":")
      index = time_array.length - 1
      while index >= 0
        if time_array.length == 3
          total_minutes += time_array[index].to_i if index == 1
          total_minutes += (time_array[index].to_i * 60) if index == 0
        elsif time_array.length == 2
          total_minutes += time_array[index].to_i if index == 0
        end
        index -= 1
      end

      if total_minutes < 10
        "80"
      elsif total_minutes < 20
        "110"
      elsif total_minutes < 30
        "130"
      elsif total_minutes < 40
        "150"
      elsif total_minutes < 50
        "170"
      elsif total_minutes < 60
        "190"
      elsif total_minutes < 70
        "210"
      elsif total_minutes < 80
        "230"
      elsif total_minutes < 90
        "250"
      elsif total_minutes < 100
        "270"
      elsif total_minutes < 110
        "290"
      elsif total_minutes < 120
        "310"
      else
        "Unknown"
      end
    end

end
