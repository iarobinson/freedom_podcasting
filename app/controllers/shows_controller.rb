class ShowsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_show, only: [:show, :edit, :update, :destroy]

  def index
    @shows = current_user.shows
  end

  def show
    @episodes = @show.episodes
  end

  def new
    @show = Show.new
  end

  def edit
  end

  def create
    @show = Show.new(show_params)
    @show.users << current_user

    respond_to do |format|
      if @show.save
        format.html { redirect_to @show, notice: 'Show was successfully created.' }
        format.json { render :show, status: :created, location: @show }
      else
        format.html { render :new }
        format.json { render json: @show.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    respond_to do |format|
      if @show.update(show_params)
        format.html { redirect_to @show, notice: 'Show was successfully updated.' }
        format.json { render :show, status: :ok, location: @show }
      else
        format.html { render :edit }
        format.json { render json: @show.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @show.destroy
    respond_to do |format|
      format.html { redirect_to shows_url, notice: 'Show was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private

    def set_show
      @show = Show.find(params[:id])
    end

    def show_params
      params.require(:show).permit(
        :title, :host, :website, :category, :description, :subtitle, :show_id
      )
    end
end