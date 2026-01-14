module RespondToJson
  extend ActiveSupport::Concern

  included do
    respond_to :json
  end

  def authenticate_user!(options = {})
    super(options)
  rescue StandardError
    render json: { error: 'You need to log in' }, status: :unauthorized
  end
end
