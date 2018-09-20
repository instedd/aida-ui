class Api::NotificationsController < ActionController::Base
  before_action :set_raven_context
  rescue_from ActionController::ParameterMissing, with: :render_unprocessable_entity_response

  def create_message
    bot = Bot.find_by_notifications_secret(params[:notifications_secret])
    return render json: {error: "Unknown notification secret"}, status: :unauthorized unless bot

    notification = Notification.find_by uuid: params[:uuid]
    return render json: {error: "Notification not found"}, status: :not_found unless notification
    return render json: {error: "Invalid notification secret"}, status: :unauthorized unless bot == notification.bot
    return render json: {error: "Unsupported notification type"}, status: :bad_request if notification.type != 'human_override'

    notification.add_message!(JSON.parse(request.raw_post))

    ActionCable.server.broadcast("human_override_channel_#{notification.id}", notification.data['messages'].last)

    if notification.save
      render json: {result: :ok}
    else
      render json: notification.errors, status: :unprocessable_entity
    end
  end

  def create
    bot = Bot.find_by_notifications_secret(params[:notifications_secret])
    return render json: {error: "Unknown notification secret"}, status: :unauthorized unless bot

    content = JSON.parse(request.raw_post) rescue notification_params

    pending_human_override_for_session = Notification.pending_human_override_for_session(content['data']['session_id']).first

    if (content['type'] == 'human_override' && pending_human_override_for_session)
      @notification = pending_human_override_for_session
      @notification.add_message!({
        "type"=>"text",
        "direction"=>"uto",
        "content"=>content['data']['message']
      })
    else
      @notification = bot.notifications.create(content)
    end

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
