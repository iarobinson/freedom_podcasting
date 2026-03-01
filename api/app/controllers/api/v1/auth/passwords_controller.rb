module Api
  module V1
    module Auth
      class PasswordsController < ApplicationController
        skip_before_action :authenticate_user!

        # POST /api/v1/auth/password
        # Accepts: { email: "..." }
        # Always returns 200 to prevent email enumeration.
        def create
          user = User.find_by(email: params[:email]&.downcase&.strip)
          user&.send_reset_password_instructions
          render json: { message: "If that email is registered, a reset link is on its way." }, status: :ok
        end

        # PUT /api/v1/auth/password
        # Accepts: { reset_password_token: "...", password: "...", password_confirmation: "..." }
        def update
          user = User.with_reset_password_token(params[:reset_password_token].to_s)

          if user.nil? || !user.reset_password_period_valid?
            render json: { error: "Invalid or expired reset token." }, status: :unprocessable_entity
            return
          end

          if user.reset_password(params[:password], params[:password_confirmation])
            render json: { message: "Password updated. Please sign in." }, status: :ok
          else
            render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
          end
        end
      end
    end
  end
end
