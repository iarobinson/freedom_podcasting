module EpisodesHelper

  def set_episode_production_cost(episode)
    if episode.itunes_duration <= 10
      episode.client_cost = 80
    elsif episode.itunes_duration <= 20
      episode.client_cost = 100
    elsif episode.itunes_duration <= 30
      episode.client_cost = 120
    elsif episode.itunes_duration <= 40
      episode.client_cost = 140
    elsif episode.itunes_duration <= 50
      episode.client_cost = 160
    elsif episode.itunes_duration <= 30
      episode.client_cost = 180
    elsif episode.itunes_duration <= 30
      episode.client_cost = 200
    elsif episode.itunes_duration <= 30
      episode.client_cost = 220
    end
  end

end
