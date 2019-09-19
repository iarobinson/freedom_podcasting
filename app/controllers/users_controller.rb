class UsersController < ApplicationController
  before_action :set_user, only: [:edit, :update, :show]

  def index
    @users = User.all
  end

  def show
  end

  def edit
    unless current_user == @user
      redirect_to users_path, notice: "You can't edit someone else's account."
    end
  end

  def update
    if @user.update(user_params)
      redirect_to user_path(@user), notice: "Your update has been saved."
    else
      redirect_to user_path(@user), notice: "Something wen't wrong."
    end
  end

  private

    def set_user
      @user = User.find(params[:id])
    end

    def user_params
      params.require(:user).permit(
        :email, :first_name, :last_name, :address, :city, :state, :country, :zip,
        :name, :status, :avatar
      )
    end
end
