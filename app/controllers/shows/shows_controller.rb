class Shows::ShowsController < ApplicationController
  before_action :set_show

  def administrator_dashboard
  end

  private

    def set_show
      @show = Show.find(params[:show_id])
    end
end
