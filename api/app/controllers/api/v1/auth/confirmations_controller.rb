module Api::V1::Auth
  class ConfirmationsController < ApplicationController
    skip_before_action :authenticate_user!, only: [:confirm]

    # GET /api/v1/auth/confirm?token=xxx
    def confirm
      user = User.find_by(confirmation_token: params[:token])
      if user.nil?
        render json: { error: "Invalid confirmation link." }, status: :unprocessable_entity
      elsif user.confirmation_sent_at < 7.days.ago
        render json: { error: "This link has expired. Please request a new one from your dashboard." }, status: :unprocessable_entity
      else
        user.update!(confirmed_at: Time.current, confirmation_token: nil)
        render json: { message: "Email confirmed." }
      end
    end

    # POST /api/v1/auth/resend-confirmation
    def resend
      if current_user.confirmed_at?
        render json: { message: "Email is already confirmed." }
      else
        current_user.generate_confirmation_token!
        UserMailer.verification_email(current_user).deliver_later
        render json: { message: "Verification email sent." }
      end
    end
  end
end
