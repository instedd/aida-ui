module EmailHelpers
  def clear_mail_deliveries
    ActionMailer::Base.deliveries.clear
  end

  def all_mail_deliveries
    ActionMailer::Base.deliveries
  end

  def all_mail_destinations
    ActionMailer::Base.deliveries.flat_map do |d|
      d.destinations.flat_map do |to|
        to.split(", ")
      end
    end
  end

  class MailerUrlHelper
    def method_missing(m, *args)
      url_options = Rails.application.config.action_mailer.default_url_options
      Rails.application.routes.url_helpers.send(m, url_options.merge(*args))
    end
  end

  def mailer_url_helper
    MailerUrlHelper.new
  end
end

RSpec.configure do |config|
  config.include EmailHelpers, type: :controller
  config.include EmailHelpers, type: :service
  config.include EmailHelpers, type: :job
end
