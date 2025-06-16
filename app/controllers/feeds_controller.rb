class FeedsController < ApplicationController
  def show
    @show = Show.find(params[:id])
    @episodes = @show.episodes.order(published: :desc)

    respond_to do |format|
      format.xml
      # format.html { render xml: @show }
    end
  end
end