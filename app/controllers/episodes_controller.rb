class EpisodesController < ApplicationController
  before_action :authenticate_user!

  def index
    @episodes = Episode.all
  end
end
