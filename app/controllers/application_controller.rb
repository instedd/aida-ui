class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception
  before_action :set_raven_context

  private

  def set_raven_context
    if current_user
      Raven.user_context(
        id: current_user.id,
        email: current_user.email,
        username: current_user.name,
        ip_address: request.ip,
      )
    else
      Raven.user_context(
        ip_address: request.ip,
      )
    end
    Raven.extra_context(
      params: params.to_unsafe_h,
      url: request.url,
      version: VersionHelper.version_name,
    )
  end
end
