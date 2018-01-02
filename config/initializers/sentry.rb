Rails.application.config.send "sentry_public_dsn=", ENV["SENTRY_PUBLIC_DSN"]

Raven.configure do |config|
  config.sanitize_fields = Rails.application.config.filter_parameters.map(&:to_s)
end
