class EpisodesController < ApplicationController
  before_action :set_episode, only: [:show, :edit, :update, :destroy]

  def index
    @episodes = Episode.all
  end

  def show
  end

  def new
    @episode = Episode.new

  end

  def edit
  end

  def create
    @episode = Episode.new(episode_params)
    @show = Show.find(episode_params[:show_id])
    @show.users << current_user

    respond_to do |format|
      if @episode.save
        format.html { redirect_to shows_path(@show), notice: 'Episode was successfully created.' }
        format.json { render :show, status: :created, location: @episode }
      else
        format.html { render :new }
        format.json { render json: @episode.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    respond_to do |format|
      if @episode.update(episode_params)
        format.html { redirect_to @episode, notice: 'Episode was successfully updated.' }
        format.json { render :show, status: :ok, location: @episode }
      else
        format.html { render :edit }
        format.json { render json: @episode.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @episode.destroy
    respond_to do |format|
      format.html { redirect_to episodes_url, notice: 'Episode was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    def set_episode
      @episode = Episode.find(params[:id])
    end

    def episode_params
      params.require(:episode).permit(:title, :number, :client_cost, :show_id)
    end
end
