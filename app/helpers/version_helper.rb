module VersionHelper
  def self.version_name
    # TODO collapse if ui_version_name and Backend.version match
    "ui: #{Rails.application.config.ui_version_name} - engine: #{Backend.version rescue "none"}"
  end
end
