class FeedsController < ApplicationController
  def show
    @show = Show.find(params[:id])
    @episodes = @show.episodes.order(created_at: :desc)

    respond_to do |format|
      format.rss { render layout: false }
    end
  end
end