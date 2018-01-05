class Behaviour < ApplicationRecord
  belongs_to :bot

  has_many :translations, dependent: :destroy

  validates :kind, inclusion: { in: %w(front_desk language_detector keyword_responder survey scheduled_messages) }

  validate :config_must_match_schema

  default_scope { order(:order) }

  scope :of_bots_owned_by, -> (user) { Behaviour.where(bot: user.bots) }
  scope :skills, ->{ where.not(kind: 'front_desk') }
  scope :enabled, ->{ where(enabled: true) }

  # duplicated in ScheduledMessages.jsx
  DELAY_OPTIONS = {
    60 => '1 hour',
    1440 => '1 day',
    10080 => '1 week',
    40320 => '1 month', # 28 days month so we end up in the same day of week
  }

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
        "threshold" => 0.5
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
                     when "survey"
                       {
                         kind: "survey",
                         name: "Survey",
                         config: {
                           "schedule" => "",
                           "questions" => [],
                           "choice_lists" => []
                         }
                       }
                     when "scheduled_messages"
                       {
                         kind: "scheduled_messages",
                         name: "Scheduled messages",
                         config: {
                           "schedule_type" => "since_last_incoming_message",
                           "messages" => []
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
      }.tap do |manifest_fragment|
        manifest_fragment[:relevant] = config["relevant"] if config["relevant"].present?
      end
    when "language_detector"
      {
        type: kind,
        explanation: config["explanation"],
        languages: Hash[config["languages"].map do |lang|
                          [lang["code"], lang["keywords"].split(/,\s*/)]
                        end]
      }
    when "survey"
      {
        type: kind,
        id: id.to_s,
        name: name,
        schedule: config["schedule"],
        questions: config["questions"].map.with_index do |question, i|
          {
            type: question["type"],
            name: question["name"],
            message: localized_value("questions/[name=#{question['name']}]/message")
          }.tap do |question_fragment|
            question_fragment[:choices] = question["choices"] if question["choices"].present?
            question_fragment[:relevant] = question["relevant"] if question["relevant"].present?
          end
        end,
        choice_lists: config["choice_lists"].map.with_index do |choice_list, i|
          {
            name: choice_list["name"],
            choices: choice_list["choices"].map.with_index do |choice, j|
              {
                name: choice["name"],
                labels: localized_value("choice_lists/[name=#{choice_list['name']}]/choices/[name=#{choice['name']}]/labels") do |labels|
                  labels.split(/,\s*/)
                end
              }
            end
          }
        end
      }.tap do |manifest_fragment|
        manifest_fragment[:relevant] = config["relevant"] if config["relevant"].present?
      end
    when "scheduled_messages"
      {
        type: kind,
        id: id.to_s,
        name: name,
        schedule_type: config["schedule_type"],
        messages: config["messages"].map do |message|
          {
            delay: message["delay"].to_s,
            message: localized_value("messages/[id=#{message['id']}]/message")
          }
        end
      }.tap do |manifest_fragment|
        manifest_fragment[:relevant] = config["relevant"] if config["relevant"].present?
      end
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
    when "survey"
      [
        config["questions"].map do |question|
          translation_key("questions/[name=#{question['name']}]/message",
                          "Question #{question['name']}")
        end,
        config["choice_lists"].map do |choice_list|
          choice_list["choices"].map do |choice|
            translation_key("choice_lists/[name=#{choice_list['name']}]/choices/[name=#{choice['name']}]/labels",
                            "Choices #{choice_list['name']}, option #{choice['name']}")
          end
        end
      ].flatten
    when "scheduled_messages"
      config["messages"].map.with_index do |message, i|
        translation_key("messages/[id=#{message['id']}]/message", DELAY_OPTIONS[message['delay']])
      end
    else
      raise NotImplementedError
    end
  end

  private

  def get_in_config(key)
    key.to_s.split(/\//).inject(config) do |value, part|
      case value
      when Array
        if part =~ /\[(.*)=(.*)\]/
          value.select { |e| e[$1] == $2 }.first
        else
          value[part.to_i]
        end
      when Hash
        value[part]
      else
        fail "invalid config path #{key}"
      end
    end
  end

  def translation_key(key, label)
    {
      key: key,
      label: label,
      default_translation: get_in_config(key)
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
    when "survey"
      "#/definitions/surveyConfig"
    when "scheduled_messages"
      "#/definitions/scheduledMessagesConfig"
    else
      fail "config schema not defined"
    end
  end

  def localized_message(key)
    {
      message: localized_value(key)
    }
  end

  def localized_value(key, &block)
    languages = bot.available_languages
    key_translations = translations.select { |t| t.key == key.to_s }

    default_language = languages.first
    value = get_in_config(key)
    default_value = if block_given?
                      yield value
                    else
                      value
                    end

    # value for default language
    result = { default_language => default_value }

    # values for other languages, with fallback to default language
    languages.drop(1).map do |lang|
      translation = key_translations.find { |t| t.lang == lang }
      value = if translation.present?
                if block_given?
                  yield translation.value
                else
                  translation.value
                end
              else
                default_value
              end
      result[lang] = value
    end

    result
  end
end
