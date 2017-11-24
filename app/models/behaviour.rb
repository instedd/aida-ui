class Behaviour < ApplicationRecord
  belongs_to :bot

  validates :name, presence: true
  validates :kind, inclusion: { in: %w(front_desk) }

  validate :config_must_match_schema

  default_scope { order(:order) }

  def self.create_front_desk!(params = {})
    default_params = {
      kind: "front_desk",
      name: "Front Desk",
      order: 0,
      enabled: true,
      config: {
        "greeting" => { "message" => { "en" => "" }},
        "introduction" => { "message" => { "en" => "" }},
        "not_understood" => { "message" => { "en" => "" }},
        "clarification" => { "message" => { "en" => "" }},
        "threshold" => 0.7
      }
    }
    create! default_params.merge(params)
  end

  private

  def config_must_match_schema
    unless JSON::Validator.validate(schema_file, config, fragment: config_schema_fragment)
      errors.add(:config, "does not match schema")
    end
  end

  def schema_file
    Rails.root.join("app", "schemas", "types.json").read
  end

  def config_schema_fragment
    case kind
    when "front_desk"
      "#/definitions/frontDeskConfig"
    else
      fail "config schema not defined"
    end
  end

end
