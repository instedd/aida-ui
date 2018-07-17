class Api::NotificationsController < ActionController::Base
  before_action :set_raven_context
  rescue_from ActionController::ParameterMissing, with: :render_unprocessable_entity_response

  def create
    bot = Bot.find_by_notifications_secret(params[:notifications_secret])
    return render json: {error: "Unknown notification secret"}, status: :unauthorized unless bot

    @notification = bot.notifications.create! notification_params

    if @notification.save
      alert_by_email_if_needed
      render json: {result: :ok}
    else
      render json: @notification.errors, status: :unprocessable_entity
    end
  end

  def alert_by_email_if_needed
    mailer = PolicyEnforcementMailer.with(notification: @notification)
    if @notification.notification_type == 'policy_enforcement'
      action = @notification.data['action']
      mailer.bot_blocked.deliver_later if action == 'block'
    end
  end

  private
    def notification_params
      the_params = params.require(:notification).permit(:type)
      the_params[:data] = params.require(:notification).fetch(:data, {}).permit!
      the_params
    end

    def render_unprocessable_entity_response(exception)
      render json: 'Invalid notification', status: :unprocessable_entity
    end

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
