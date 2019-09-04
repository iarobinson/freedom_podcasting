class Shows::EpisodesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_show, only: [:index, :new, :show, :edit, :update, :destroy]

  def index
    @episodes = Episode.where(show_id: params[:show_id])
  end

  def show
    @episode = Episode.find(show_id: params[:episode_id])
  end

  def new
    @episode = Episode.new
  end

  def edit
  end

  def create
    p "In Shows::EpisodesController#create"
    binding.pry
    @episode = Episode.new(episode_params)

    respond_to do |format|
      if @episode.save
        format.html { redirect_to @episode, notice: 'Episode was successfully created.' }
        format.json { render :episode, status: :created, location: @episode }
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
    def set_show
      @show = Show.find(params[:show_id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def episode_params
      params.require(:episode).permit(
        :title, :host, :website, :category, :description, :subtitle
      )
    end
end
