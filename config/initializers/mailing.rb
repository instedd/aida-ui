Rails.application.config.tap do |config|
  base_url = URI.parse(Settings.base_url)
  config.action_mailer.default_url_options = { protocol: base_url.scheme, host: base_url.host, port: base_url.port }

  config.action_mailer.asset_host = Settings.base_url

  config.action_mailer.delivery_method = Settings.mailer.delivery_method.to_sym
  config.action_mailer.smtp_settings = Settings.smtp_settings.to_h
end

