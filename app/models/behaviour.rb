class Behaviour < ApplicationRecord
  belongs_to :bot

  has_many :translations, dependent: :destroy

  validates :kind, inclusion: { in: %w(front_desk language_detector keyword_responder survey scheduled_messages decision_tree) }

  validate :config_must_match_schema

  default_scope { order(:order) }

  scope :of_bots_owned_by, -> (user) { Behaviour.where(bot: user.bots) }
  scope :skills, ->{ where.not(kind: 'front_desk') }
  scope :enabled, ->{ where(enabled: true) }

  # duplicated in ScheduledMessages.jsx
  # manifest expects delays in minutes
  DELAY_UNITS = {
    'minute' => 1,
    'hour'   => 60,
    'day'    => 1440,
    'week'   => 10080,
    'month'  => 40320 # 28 days month so we end up in the same day of week
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
                     when "decision_tree"
                        uuid = SecureRandom.uuid
                        {
                          kind: "decision_tree",
                          name: "Decision tree",
                          config: {
                            "explanation" => "",
                            "clarification" => "",
                            "tree": {
                              initial: uuid,
                              nodes: {
                                uuid => {
                                  id: uuid,
                                  message: "",
                                  options: []
                                }
                              }
                            }
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
            question_fragment[:constraint] = question["constraint"] if question["constraint"].present?
            question_fragment[:constraint_message] = localized_value("questions/[name=#{question['name']}]/constraint_message") if question["constraint_message"].present?
            question_fragment[:choice_filter] = question["choice_filter"] if question["choice_filter"].present?
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
              }.tap do |choice_fragment|
                choice_fragment[:attributes] = choice["attributes"] if choice["attributes"].present?
              end
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
          case config["schedule_type"]
          when "since_last_incoming_message"
            {
              delay: message["delay"] * DELAY_UNITS[message["delay_unit"]],
              message: localized_value("messages/[id=#{message['id']}]/message")
            }
          when "fixed_time"
            {
              schedule: message["schedule"],
              message: localized_value("messages/[id=#{message['id']}]/message")
            }
          when "recurrent"
            recurrence = message["recurrence"]
            start_date = Time.parse(config["start_date"]).beginning_of_day
            type = recurrence["type"]
            every = recurrence["every"]
            each = recurrence["each"]
            on = recurrence["on"]
            at = Time.parse(recurrence["at"])
            start = start_date + (at - at.beginning_of_day).seconds
            start = start.utc.to_s(:iso8601)
            {
              recurrence: case type
                          when 'daily'
                            { type: 'daily', every: every, start: start }
                          when 'weekly'
                            { type: 'weekly', every: every, on: on, start: start }
                          when 'monthly'
                            { type: 'monthly', every: every, each: each, start: start }
                          end,
              message: localized_value("messages/[id=#{message['id']}]/message")
            }
          else
            raise NotImplementedError
          end
        end
      }.tap do |manifest_fragment|
        manifest_fragment[:relevant] = config["relevant"] if config["relevant"].present?
      end
    when "decision_tree"
      {
        type: kind,
        id: id.to_s,
        name: name,
        explanation: localized_value(:explanation),
        clarification: localized_value(:clarification)
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
          keys = [translation_key("questions/[name=#{question['name']}]/message",
                                  "Question #{question['name']}")]
          if question['constraint_message'].present?
            keys << translation_key("questions/[name=#{question['name']}]/constraint_message",
                                    "Constraint message for #{question['name']}")
          end
          keys
        end,
        config["choice_lists"].map do |choice_list|
          choice_list["choices"].map do |choice|
            translation_key("choice_lists/[name=#{choice_list['name']}]/choices/[name=#{choice['name']}]/labels",
                            "Choices #{choice_list['name']}, option #{choice['name']}")
          end
        end
      ].flatten
    when "scheduled_messages"
      case config["schedule_type"]
      when "since_last_incoming_message"
        config["messages"].map.with_index do |message, i|
          delay = message['delay']
          unit = delay == 1 ? message['delay_unit'] : message['delay_unit'].pluralize
          translation_key("messages/[id=#{message['id']}]/message", "#{delay} #{unit}")
        end
      when "fixed_time"
        config["messages"].map.with_index do |message, i|
          translation_key("messages/[id=#{message['id']}]/message", "Message")
        end
      when "recurrent"
        config["messages"].map.with_index do |message, i|
          every = message['recurrence']['every']
          each = message['recurrence']['each']
          at = message['recurrence']['at']
          on = message['recurrence']['on']
          label = case message['recurrence']['type']
                  when 'daily'
                    every == 1 ? "Daily" : "Every #{every} days"
                  when 'weekly'
                    prefix = every == 1 ? "Weekly" : "Every #{every} weeks"
                    "#{prefix} on #{on[0].titleize}"
                  when 'monthly'
                    prefix = every == 1 ? "Monthly" : "Every #{every} months"
                    "#{prefix} on day #{each}"
                  end
          label = "#{label} at #{at}"
          translation_key("messages/[id=#{message['id']}]/message", label)
        end
      else
        raise NotImplementedError
      end
    when "decision_tree"
      [
        translation_key("explanation",   "Skill explanation"),
        translation_key("clarification", "Clarification message"),
        build_array_from_tree(config["tree"]['nodes'], config["tree"]['initial'], 1)
      ].flatten
    else
      raise NotImplementedError
    end
  end

  private

  def build_array_from_tree(nodes, initial_uuid, level)
    translations = []
    uuids = [initial_uuid]
    until uuids.empty?
      uuid = uuids.shift
      translations.push(translation_key("tree/nodes/#{uuid}/message", "Question #{level}"))
      translations.concat(
        nodes[uuid]['options'].map.with_index do |option, ix|
          uuids.push(option['next']) unless option['next'].nil?
          translation_key("tree/nodes/#{uuid}/options/[next=#{option['next']}]/label",
                        "Answer #{level}.#{ix+1}")
        end
      )
      level += 1
    end

    return translations
  end

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
    when "decision_tree"
      "#/definitions/decisionTreeConfig"
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
