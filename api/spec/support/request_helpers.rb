module RequestHelpers
  def auth_headers_for(user)
    post "/api/v1/auth/login", params: { user: { email: user.email, password: user.password } }, as: :json
    { "Authorization" => response.headers["Authorization"], "Content-Type" => "application/json" }
  end
end
