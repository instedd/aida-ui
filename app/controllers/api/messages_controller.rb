class Api::MessagesController < ApplicationApiController
  after_action :verify_authorized
  before_action :load_notification, except: [:index]

  def index
    authorize Bot
    notifications = policy_scope(Notification)
      .where(notification_type: "human_override")
      .where(resolved: false)
      .select do |bot|
        bot_policy = policy(bot)
        bot_policy.can_message?
      end

    render json: notifications
  end

  def answer
    bot = @notification.bot
    authorize bot, :read_session_data?

    result = Backend.sessions_send_message(bot.uuid, @notification.data["session_id"], {message: params[:answer]})

    @notification.resolved = true

    if @notification.save
      render json: { data: result }
    else
      render json: {result: :error}, status: :bad_request
    end
  end

  private

  def load_notification
    @notification = Notification.find(params[:id])
  end
end
