class Api::CurrentUserController < ApplicationController
  protect_from_forgery with: :null_session
  before_action :authenticate_user!

  def index
    render json: { user: current_user }, status: :ok
  end

  def show
    if current_user
      render json: {
        status: 'ok',
        user: {
          id: current_user.id,
          email: current_user.email,
          created_at: current_user.created_at,
          updated_at: current_user.updated_at
        }
      }, status: :ok
    else
      render json: {
        status: 'error',
        message: 'invalid login'
      }, status: :unauthorized
    end
  end
end