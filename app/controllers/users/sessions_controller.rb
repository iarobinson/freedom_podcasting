class Users::SessionsController < Devise::SessionsController
  # Allow JSON responses for API clients
  respond_to :html, :json

  # POST /users/sign_in
  def create
    super do |user|
      if request.format.json?
        # Return JSON instead of redirect
        return render json: { status: 'ok', user: current_user_response }, status: :ok
      end
    end
  end

  # GET /users/sign_in
  def new
    if request.format.json?
      render json: { status: 'error', message: 'Use POST /users/sign_in with JSON' }, status: :unauthorized
    else
      super # normal HTML login form
    end
  end

  # DELETE /users/sign_out
  def destroy
    super do |user|
      if request.format.json?
        return render json: { status: 'ok', message: 'Signed out successfully' }, status: :ok
      end
    end
  end

  private

  # Returns a sanitized user object for JSON responses
  def current_user_response
    {
      id: current_user.id,
      email: current_user.email,
      first_name: current_user.first_name,
      last_name: current_user.last_name,
      role: current_user.role,
      created_at: current_user.created_at,
      updated_at: current_user.updated_at
    }
  end

  def respond_with(resource, _opts = {})
    render json: { status: 'success', user: resource }
  end

  def respond_to_on_destroy
    render json: { status: 'success', message: 'Logged out' }
  end
end
