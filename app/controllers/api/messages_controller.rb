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
    authorize bot, :can_message?

    return render json: {error: 'missing answer'}, status: :unprocessable_entity if params[:answer] == nil
    return render json: {error: 'empty answer'}, status: :unprocessable_entity if params[:answer] == ''

    result = Backend.sessions_send_message(@notification.data["bot_id"], @notification.data["session_id"], {message: params[:answer]})

    @notification.add_message!({
      type: 'text',
      direction: 'otu',
      content: params[:answer]
    })

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
