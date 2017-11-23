module JsonHelpers
  def json_body
    json = JSON.parse(response.body)
    json = json.map &:with_indifferent_access if json.is_a?(Array)
    json = json.with_indifferent_access if json.is_a?(Hash)
    json
  end
end

RSpec.configure do |config|
  config.include JsonHelpers, type: :controller
end
