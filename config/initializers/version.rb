VersionFilePath = "#{::Rails.root.to_s}/VERSION"

Rails.application.config.send "ui_version_name=", if FileTest.exists?(VersionFilePath) then
  IO.read(VersionFilePath)
else
  "#{Settings.version}-development"
end
