module InvitationHelper
  def invitation_link_url(invitation)
    invitation_url(token: invitation.token)
  end

  def invitation_api_json(invitation)
    {
      id: invitation.id,
      creator: invitation.creator.email,
      email: invitation.email,
      roles: invitation.roles,
      link_url: (invitation_link_url(invitation) if invitation.anonymous?),
      created_at: invitation.created_at.to_s(:iso8601)
    }
  end
end
