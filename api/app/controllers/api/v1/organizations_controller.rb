module Api::V1
  class OrganizationsController < ApplicationController
    before_action :current_organization
    before_action :require_organization_membership!

    # GET /api/v1/organizations/:slug/members
    def members
      memberships = current_organization.memberships.includes(:user).order(:created_at)
      render json: { data: memberships.map { |m| member_json(m) } }
    end

    # PATCH /api/v1/organizations/:slug — owners/admins can rename the workspace.
    # Slug is intentionally not editable: public podcast URLs depend on it.
    def update
      require_manager!
      return if performed?
      if current_organization.update(params.require(:organization).permit(:name))
        render json: { data: { id: current_organization.id, name: current_organization.name, slug: current_organization.slug, plan: current_organization.plan } }
      else
        render json: { error: current_organization.errors.full_messages.to_sentence }, status: :unprocessable_entity
      end
    end

    # GET /api/v1/organizations/:slug/overview — dashboard stats, setup facts, recent activity.
    # Activity is derived from existing timestamps rather than a separate event log.
    def overview
      org      = current_organization
      podcasts = org.podcasts.to_a
      episodes = Episode.where(podcast_id: podcasts.map(&:id))
      titles   = podcasts.index_by(&:id)

      activity = []
      podcasts.each do |p|
        activity << { kind: "podcast_created",   at: p.created_at,   text: "Podcast created: #{p.title}", podcast_slug: p.slug }
        activity << { kind: "podcast_published", at: p.published_at, text: "Podcast published: #{p.title}", podcast_slug: p.slug } if p.published_at
      end
      episodes.order(updated_at: :desc).limit(20).each do |e|
        slug = titles[e.podcast_id]&.slug
        activity << { kind: "episode_created",   at: e.created_at,   text: "Episode draft created: #{e.title.presence || 'Untitled'}", podcast_slug: slug, episode_id: e.id }
        activity << { kind: "episode_published", at: e.published_at, text: "Episode published: #{e.title}", podcast_slug: slug, episode_id: e.id } if e.status == "published" && e.published_at
      end
      org.memberships.includes(:user).where.not(invited_at: nil).each do |m|
        activity << { kind: "invite_sent", at: m.invited_at, text: "Invite sent to #{m.user.email}" }
      end
      org.invitations.each do |i|
        activity << { kind: "invite_sent", at: i.updated_at, text: "Invite sent to #{i.email}" }
      end

      render json: {
        data: {
          stats: {
            podcasts:           podcasts.size,
            published_episodes: episodes.where(status: "published").count,
            draft_episodes:     episodes.where.not(status: "published").count,
            storage_used_bytes: org.storage_used_bytes,
            storage_limit_bytes: org.plan_limits[:storage_gb] * 1024**3,
          },
          setup: {
            has_podcast:          podcasts.any?,
            missing_artwork_slug: podcasts.find { |p| p.artwork_url.blank? }&.slug,
            has_episode:          episodes.exists?,
            has_published:        episodes.where(status: "published").exists?,
            unsubmitted_slug:     podcasts.find { |p| p.published && p.apple_podcasts_url.blank? }&.slug,
            has_teammate:         org.memberships.count > 1 || org.invitations.exists?,
            at_publish_limit:     org.at_monthly_publish_limit?,
          },
          activity: activity.select { |a| a[:at] }.sort_by { |a| a[:at] }.reverse.first(8),
        },
      }
    end

    # POST /api/v1/organizations/:slug/invite
    def invite
      require_manager!
      return if enforce_member_limit!
      email = params.require(:email).strip.downcase
      role  = params.require(:role)

      unless Membership::ROLES.include?(role) && role != "owner"
        return render json: { error: "Invalid role. Must be admin, editor, or viewer." }, status: :unprocessable_entity
      end

      user = User.find_by(email: email)

      if user
        m = current_organization.memberships.find_or_initialize_by(user: user)
        if m.accepted_at?
          return render json: { error: "#{email} is already a member of this organization." }, status: :unprocessable_entity
        end
        token = SecureRandom.urlsafe_base64(32)
        m.update!(role: role, invitation_token: token, invited_at: Time.current)
        InvitationMailer.invite_existing(m, current_user).deliver_later
        render json: { message: "Invitation sent to #{email}.", data: member_json(m) }, status: :created
      else
        # Unknown email: store a pending Invitation; the signed token references it
        inv = current_organization.invitations.find_or_initialize_by(email: email)
        inv.update!(role: role, invited_by: current_user, expires_at: Invitation::TTL.from_now)
        InvitationMailer.invite_new_user(email, inv.signed_token, current_user, current_organization).deliver_later
        render json: { message: "Invitation sent to #{email}." }, status: :created
      end
    end

    # GET /api/v1/organizations/:slug/invitations
    # Pending invites from both sources: unaccepted memberships (existing users)
    # and Invitation rows (people without an account yet).
    def invitations
      require_manager!
      return if performed?
      pending_members = current_organization.memberships.includes(:user).where(accepted_at: nil).where.not(invited_at: nil)
      rows = pending_members.map { |m| { email: m.user.email, role: m.role, invited_at: m.invited_at, expired: m.invited_at < Invitation::TTL.ago } } +
             current_organization.invitations.map { |i| { email: i.email, role: i.role, invited_at: i.updated_at, expired: i.expires_at <= Time.current } }
      render json: { data: rows.sort_by { |r| r[:invited_at] }.reverse }
    end

    # POST /api/v1/organizations/:slug/invitations/resend  { email }
    def resend_invitation
      require_manager!
      return if performed?
      email = params.require(:email).strip.downcase
      if (m = pending_membership_for(email))
        m.update!(invitation_token: SecureRandom.urlsafe_base64(32), invited_at: Time.current)
        InvitationMailer.invite_existing(m, current_user).deliver_later
      elsif (inv = current_organization.invitations.find_by(email: email))
        inv.update!(expires_at: Invitation::TTL.from_now, invited_by: current_user)
        InvitationMailer.invite_new_user(email, inv.signed_token, current_user, current_organization).deliver_later
      else
        return render json: { error: "No pending invitation for #{email}." }, status: :not_found
      end
      render json: { message: "Invitation resent to #{email}." }
    end

    # DELETE /api/v1/organizations/:slug/invitations  { email }
    def revoke_invitation
      require_manager!
      return if performed?
      email = params.require(:email).strip.downcase
      record = pending_membership_for(email) || current_organization.invitations.find_by(email: email)
      return render json: { error: "No pending invitation for #{email}." }, status: :not_found unless record
      record.destroy!
      render json: { message: "Invitation for #{email} revoked." }
    end

    # DELETE /api/v1/organizations/:slug/members/:user_id
    def remove_member
      require_manager!
      m = current_organization.memberships.find_by!(user_id: params[:user_id])
      return render json: { error: "Cannot remove the organization owner." }, status: :forbidden if m.role == "owner"
      return render json: { error: "Cannot remove yourself." }, status: :forbidden if m.user == current_user
      m.destroy!
      render json: { message: "Member removed." }
    end

    # PATCH /api/v1/organizations/:slug/members/:user_id/role
    def update_member_role
      require_manager!
      m = current_organization.memberships.find_by!(user_id: params[:user_id])
      return render json: { error: "Cannot change the owner's role." }, status: :forbidden if m.role == "owner"

      new_role = params.require(:role)
      unless Membership::ROLES.include?(new_role) && new_role != "owner"
        return render json: { error: "Invalid role." }, status: :unprocessable_entity
      end

      m.update!(role: new_role)
      render json: { data: member_json(m) }
    end

    private

    # Member routes on the organization itself use params[:slug], not params[:organization_slug]
    # (params[:organization_slug] is only set for resources nested *under* organizations)
    def current_organization
      @current_organization ||= Organization.find_by!(slug: params[:slug])
    end

    def pending_membership_for(email)
      current_organization.memberships.joins(:user).where(accepted_at: nil, users: { email: email }).first
    end

    def member_json(m)
      {
        user_id:      m.user_id,
        email:        m.user.email,
        full_name:    m.user.full_name,
        role:         m.role,
        invited_at:   m.invited_at,
        accepted_at:  m.accepted_at
      }
    end
  end
end
