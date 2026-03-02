class InvitationMailer < ApplicationMailer
  default from: ENV.fetch("MAILER_FROM", "noreply@freedompodcasting.com")

  # Invite an existing user (membership row + token already stored)
  def invite_existing(membership, inviter)
    @membership = membership
    @inviter    = inviter
    @org        = membership.organization
    @invitee    = membership.user
    frontend    = ENV.fetch("FRONTEND_URL", "https://app.freedompodcasting.com")
    @accept_url = "#{frontend}/auth/accept-invitation?token=#{membership.invitation_token}"

    unless Rails.env.production?
      Rails.logger.info "=" * 60
      Rails.logger.info "[DEV] Invitation (existing user) for #{@invitee.email}:"
      Rails.logger.info @accept_url
      Rails.logger.info "=" * 60
    end

    mail(to: @invitee.email, subject: "#{@inviter.full_name} invited you to #{@org.name} on Freedom Podcasting")
  end

  # Invite a new user (signed JWT, no membership row yet)
  def invite_new_user(email, token, inviter, org)
    @email      = email
    @inviter    = inviter
    @org        = org
    frontend    = ENV.fetch("FRONTEND_URL", "https://app.freedompodcasting.com")
    @register_url = "#{frontend}/auth/register?invitation_token=#{token}&email=#{CGI.escape(email)}"

    unless Rails.env.production?
      Rails.logger.info "=" * 60
      Rails.logger.info "[DEV] Invitation (new user) for #{email}:"
      Rails.logger.info @register_url
      Rails.logger.info "=" * 60
    end

    mail(to: email, subject: "#{inviter.full_name} invited you to #{org.name} on Freedom Podcasting")
  end
end
