class Behaviour < ApplicationRecord
  belongs_to :bot

  has_many :translations, dependent: :destroy

  validates :kind, inclusion: { in: %w(front_desk language_detector keyword_responder) }

  validate :config_must_match_schema

  default_scope { order(:order) }

  scope :of_bots_owned_by, -> (user) { Behaviour.where(bot: user.bots) }
  scope :skills, ->{ where.not(kind: 'front_desk') }
  scope :enabled, ->{ where(enabled: true) }

  def self.create_front_desk!(params = {})
    default_params = {
      kind: "front_desk",
      name: "Front Desk",
      order: 0,
      enabled: true,
      config: {
        "greeting" => "",
        "introduction" => "",
        "not_understood" => "",
        "clarification" => "",
        "threshold" => 0.7
      }
    }
    create! default_params.merge(params)
  end

  def self.create_skill!(kind, params = {})
    default_params = case kind
                     when "language_detector"
                       {
                         kind: "language_detector",
                         name: "Language detector",
                         config: {
                           "explanation" => "To chat in english, say 'english'",
                           "languages" => [
                             { "code" => "en", "keywords" => "english, en" }
                           ]
                         }
                       }
                     when "keyword_responder"
                       {
                         kind: "keyword_responder",
                         name: "Keyword responder",
                         config: {
                           "explanation" => "",
                           "clarification" => "",
                           "keywords" => "",
                           "response" => ""
                         }
                       }
                     else
                       fail "invalid skill type #{kind}"
                     end
    create! default_params.merge({enabled: true}).deep_merge(params)
  end

  def manifest_fragment
    case kind
    when "front_desk"
      {
        greeting: localized_message(:greeting),
        introduction: localized_message(:introduction),
        not_understood: localized_message(:not_understood),
        clarification: localized_message(:clarification),
        threshold: config["threshold"]
      }
    when "keyword_responder"
      {
        type: kind,
        id: id.to_s,
        name: name,
        explanation: localized_value(:explanation),
        clarification: localized_value(:clarification),
        response: localized_value(:response),
        keywords: localized_value(:keywords) do |keywords|
          keywords.split(/,\s*/)
        end
      }
    when "language_detector"
      {
        type: kind,
        explanation: config["explanation"],
        languages: Hash[config["languages"].map do |lang|
                          [lang["code"], lang["keywords"].split(/,\s*/)]
                        end]
      }
    else
      raise NotImplementedError
    end
  end

  def translation_keys
    case kind
    when "front_desk"
      [
        translation_key("greeting",       "Greeting"),
        translation_key("introduction",   "Skills introduction"),
        translation_key("not_understood", "Didn't understand message"),
        translation_key("clarification",  "Clarification message")
      ]
    when "keyword_responder"
      [
        translation_key("explanation",   "Skill explanation"),
        translation_key("clarification", "Clarification message"),
        translation_key("response",      "Response message"),
        translation_key("keywords",      "Valid keywords (comma separated)")
      ]
    when "language_detector"
      []
    else
      raise NotImplementedError
    end
  end

  private

  def translation_key(key, label)
    {
      key: key,
      label: label,
      default_translation: config[key]
    }
  end

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
    when "language_detector"
      "#/definitions/languageDetectorConfig"
    when "keyword_responder"
      "#/definitions/keywordResponderConfig"
    else
      fail "config schema not defined"
    end
  end

  def localized_message(key)
    {
      message: {
        en: config[key.to_s]
      }
    }
  end

  def localized_value(key, &block)
    value = config[key.to_s]
    {
      en: if block_given? then yield value else value end
    }
  end
end
