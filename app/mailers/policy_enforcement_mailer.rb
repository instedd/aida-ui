class PolicyEnforcementMailer < ApplicationMailer
  before_action :set_notification_and_bot

  def bot_blocked
    @reason = @notification.data['reason']
    mail(to: @bot.owner.email, subject: "Bot #{@bot.name} has been blocked by Policy Enforcement")
  end

  private

  def set_notification_and_bot
    @notification = params[:notification]
    @bot = @notification.bot
    @bot_url = bot_behaviour_url(@bot.id)
  end
end
