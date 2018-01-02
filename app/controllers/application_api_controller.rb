class ApplicationApiController < ActionController::Base
  before_action :authenticate_user!
  before_action :set_raven_context

  rescue_from ActiveRecord::RecordInvalid, with: :render_unprocessable_entity_response
  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found_response

  private

  def render_unprocessable_entity_response(exception)
    render json: exception.record.errors, status: :unprocessable_entity
  end

  def render_not_found_response(exception)
    render json: { error: 'Not found' }, status: :not_found
  end

  def set_raven_context
    Raven.user_context(
      id: current_user.id,
      email: current_user.email,
      username: current_user.name,
      ip_address: request.ip,
    )
    Raven.extra_context(
      params: params.to_unsafe_h,
      url: request.url,
      version: VersionHelper.version_name,
    )
  end
end
