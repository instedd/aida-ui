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

  def resolve
    bot = @notification.bot
    authorize bot, :can_message?

    result = Backend.sessions_forward_messages(@notification.data["bot_id"], @notification.data["session_id"], {forward_messages_id: nil})

    if result['forward_messages_id'] == ''
      @notification.bot_forwarding_messages!(false)
      @notification.resolved = true
    else
      render json: {result: :error}, status: :bad_request and return
    end

    if @notification.save
      render json: {}
    else
      render json: {result: :error}, status: :bad_request
    end
  end

  def answer
    bot = @notification.bot
    authorize bot, :can_message?

    return render json: {error: 'missing answer'}, status: :unprocessable_entity if params[:answer] == nil
    return render json: {error: 'empty answer'}, status: :unprocessable_entity if params[:answer] == ''

    unless @notification.bot_forwarding_messages?()
      result = Backend.sessions_forward_messages(@notification.data["bot_id"], @notification.data["session_id"], {forward_messages_id: @notification.uuid})
      @notification.bot_forwarding_messages!(true) if result['forward_messages_id']
    end

    result = Backend.sessions_send_message(@notification.data["bot_id"], @notification.data["session_id"], {message: params[:answer]})

    @notification.add_message!({
      type: 'text',
      direction: 'otu',
      content: params[:answer]
    })

    if @notification.save
      render json: { message: @notification.messages.last }
    else
      render json: {result: :error}, status: :bad_request
    end
  end

  private

  def load_notification
    @notification = Notification.find(params[:id])
  end
end
